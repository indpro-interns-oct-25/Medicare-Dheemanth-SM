import os
from typing import List
import numpy as np
from sentence_transformers import SentenceTransformer
from threading import Lock

class EmbeddingService:
    _model = None
    _lock = Lock()

    def __init__(self):
        model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        with self._lock:
            if EmbeddingService._model is None:
                EmbeddingService._model = SentenceTransformer(model_name)
        self.model = EmbeddingService._model

    def dimension(self) -> int:
        return self.model.get_sentence_embedding_dimension()

    def generate(self, text: str) -> np.ndarray:
        emb = self.model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        return emb.astype(np.float32)

    def batch_generate(self, texts: List[str]) -> np.ndarray:
        embs = self.model.encode(texts, batch_size=32, convert_to_numpy=True, normalize_embeddings=True)
        return embs.astype(np.float32)
