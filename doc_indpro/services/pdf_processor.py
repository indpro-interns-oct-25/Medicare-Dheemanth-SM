import os
import re
from typing import List, Tuple
from pypdf import PdfReader
from fastapi import HTTPException

SAFE_NAME_RE = re.compile(r"[^a-zA-Z0-9._-]")

def sanitize_filename(name: str) -> str:
    base = os.path.basename(name)
    return SAFE_NAME_RE.sub("_", base)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        from io import BytesIO
        reader = PdfReader(BytesIO(file_bytes))
        texts = []
        for page in reader.pages:
            txt = page.extract_text() or ""
            texts.append(txt)
        content = "\n".join(texts).strip()
        if not content:
            raise ValueError("No extractable text found (may be scanned; add OCR).")
        return content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF parse error: {e}")

def split_text(text: str, chunk_size: int, overlap: int) -> List[Tuple[str, int, int]]:
    if chunk_size <= 0 or overlap < 0 or overlap >= chunk_size:
        raise HTTPException(status_code=400, detail="Invalid chunk parameters")
    chunks: List[Tuple[str,int,int]] = []
    start = 0
    chunk_id = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        chunk = text[start:end]
        chunks.append((chunk, start, chunk_id))
        start = start + chunk_size - overlap
        chunk_id += 1
    return chunks
