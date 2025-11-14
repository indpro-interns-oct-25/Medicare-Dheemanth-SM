from pydantic import BaseModel, Field
from typing import List, Optional

class ChunkMetadata(BaseModel):
    filename: str
    chunk_id: int
    offset: int

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = 5
    score_threshold: float = 0.7

class SearchResultItem(BaseModel):
    text: str
    score: float
    metadata: ChunkMetadata

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    answer: Optional[str] = None
