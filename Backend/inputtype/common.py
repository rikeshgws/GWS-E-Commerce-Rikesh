import strawberry
from typing import Optional

@strawberry.type
class GenericResponse:
    success: bool
    message: str
    data: Optional[str] = None