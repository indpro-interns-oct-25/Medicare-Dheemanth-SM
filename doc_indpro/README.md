# PDF Semantic Search (FastAPI + Remote Qdrant)

## Quick start
1) Fill .env with your QDRANT_URL and QDRANT_API_KEY
2) docker compose up --build
3) Open http://localhost:8000 (frontend) and http://localhost:8000/docs (API)
4) Check /health to verify remote Qdrant connectivity

## Endpoints
- POST /upload (multipart): upload a PDF; parses in memory, chunks, embeds, stores remotely in Qdrant
- POST /search (JSON): {"query":"...", "top_k":5, "score_threshold":0.7}
- GET /health: service + remote Qdrant status

Auth: send header X-API-Key if API_AUTH_TOKEN is set in .env
