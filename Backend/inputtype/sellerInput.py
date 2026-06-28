import strawberry
from typing import Optional

@strawberry.input
class SellerUpdateInput:
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None