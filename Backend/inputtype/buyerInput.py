import strawberry
from typing import Optional

@strawberry.input
class BuyerUpdateInput:
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

@strawberry.input
class CancelOrderInput:
    order_id: int
    cancel_reason: str