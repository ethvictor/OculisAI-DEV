from pydantic import BaseModel
from typing import Optional

class Query(BaseModel):
    query: str
    url: str
    analysis_type: Optional[str] = None
    is_competitor: Optional[bool] = False
