import os
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http import models as qm
from fastapi import HTTPException

class VectorStore:
    def __init__(self, vector_size: int):
        url = os.getenv("QDRANT_URL", "")
        api_key = os.getenv("QDRANT_API_KEY", None)
        if not url:
            raise HTTPException(status_code=500, detail="QDRANT_URL is required")
        self.collection = os.getenv("COLLECTION_NAME", "pdf_chunks")
        try:
            self.client = QdrantClient(url=url, api_key=api_key)
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Qdrant client init failed: {e}")
        self._ensure_collection(vector_size)

    def _ensure_collection(self, vector_size: int):
        try:
            cols = self.client.get_collections()
            names = [c.name for c in cols.collections]
            if self.collection not in names:
                self.client.create_collection(
                    collection_name=self.collection,
                    vectors_config=qm.VectorParams(size=vector_size, distance=qm.Distance.COSINE),
                )
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Qdrant not ready or auth failed: {e}")

    def upsert_chunks(self, points: List[Dict[str, Any]]):
        try:
            self.client.upsert(
                collection_name=self.collection,
                points=qm.Batch(
                    ids=[p["id"] for p in points],
                    vectors=[p["vector"] for p in points],
                    payloads=[p["payload"] for p in points],
                ),
                wait=True,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upsert failed: {e}")

    def search(self, query_vector, top_k: int, score_threshold: float):
        try:
            return self.client.search(
                collection_name=self.collection,
                query_vector=query_vector,
                limit=top_k,
                score_threshold=score_threshold,
                with_payload=True,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Search failed: {e}")

    def health(self):
        try:
            _ = self.client.get_collections()
            return True
        except Exception:
            return False
