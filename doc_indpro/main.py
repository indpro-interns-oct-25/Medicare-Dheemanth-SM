import os
import time
import uuid  # NEW: for Qdrant-compliant point IDs
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from models.schemas import SearchRequest, SearchResponse, SearchResultItem, ChunkMetadata
from services.pdf_processor import extract_text_from_pdf, split_text, sanitize_filename
from services.embeddings import EmbeddingService
from services.vector_store import VectorStore

# Optional OpenAI for synthesis/rerank
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
openai_client = None
if OPENAI_API_KEY:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", "8000"))
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
API_AUTH_TOKEN = os.getenv("API_AUTH_TOKEN", "")

app = FastAPI(title="PDF Semantic Search")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve ./static at /static
app.mount("/static", StaticFiles(directory="static"), name="static")

emb = EmbeddingService()
vs = VectorStore(vector_size=emb.dimension())

def require_api_key(x_api_key: Optional[str] = Header(default=None)):
    if API_AUTH_TOKEN:
        if not x_api_key or x_api_key != API_AUTH_TOKEN:
            raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return True

@app.get("/", response_class=HTMLResponse)
async def root():
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return HTMLResponse(
            "<h1>Static index not found</h1><p>Ensure static/index.html exists.</p>",
            status_code=500,
        )

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "qdrant": "ok" if vs.health() else "down",
        "collection": os.getenv("COLLECTION_NAME", "pdf_chunks"),
        "embedding_dim": emb.dimension(),
        "openai_enabled": bool(OPENAI_API_KEY),
    }

@app.post("/upload")
async def upload(file: UploadFile = File(...), ok: bool = Depends(require_api_key)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    filename = sanitize_filename(file.filename or "upload.pdf")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    t0 = time.time()
    text = extract_text_from_pdf(data)
    chunks = split_text(text, CHUNK_SIZE, CHUNK_OVERLAP)

    # Generate embeddings in batch (normalize to float32)
    vectors = emb.batch_generate([c[0] for c in chunks])

    # Build Qdrant points: use UUIDs for 'id' to satisfy Qdrant's requirements
    points = []
    for (chunk_text, offset, chunk_id), vec in zip(chunks, vectors):
        points.append({
            "id": str(uuid.uuid4()),  # Qdrant-compliant ID
            "vector": vec.tolist(),
            "payload": {
                "filename": filename,
                "chunk_id": chunk_id,
                "offset": offset,
                "text": chunk_text,
                "doc_id": filename,  # optional grouping key
            }
        })

    vs.upsert_chunks(points)
    dt = time.time() - t0
    return {"filename": filename, "num_chunks": len(chunks), "elapsed_sec": round(dt, 3)}

@app.post("/search", response_model=SearchResponse)
async def search(req: SearchRequest, ok: bool = Depends(require_api_key)):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query must not be empty")

    qv = emb.generate(req.query)
    matches = vs.search(qv.tolist(), top_k=req.top_k, score_threshold=req.score_threshold)

    items: List[SearchResultItem] = []
    for m in matches:
        payload = m.payload or {}
        text = payload.get("text", "")
        filename = payload.get("filename", "")
        chunk_id = int(payload.get("chunk_id", 0))
        offset = int(payload.get("offset", 0))
        items.append(SearchResultItem(
            text=text[:1000],
            score=float(m.score),
            metadata=ChunkMetadata(filename=filename, chunk_id=chunk_id, offset=offset),
        ))

    answer = None
    if OPENAI_API_KEY and items:
        answer = await synthesize_answer(req.query, items)

    return SearchResponse(results=items, answer=answer)

async def synthesize_answer(query: str, items: List[SearchResultItem]) -> str:
    context = "\n\n".join([
        f"[Source {i.metadata.filename} #{i.metadata.chunk_id} | score={i.score:.3f}]\n{i.text}"
        for i in items
    ])
    prompt = (
        "Answer the user's question ONLY using the provided source excerpts. "
        "Cite sources inline like (filename#chunk_id). If the answer isn't in the sources, say you don't know.\n\n"
        f"Question: {query}\n\nSources:\n{context}\n\nAnswer in 3-6 sentences."
    )
    try:
        resp = openai_client.chat.completions.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[
                {"role": "system", "content": "Be accurate and concise."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=300,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return ""
