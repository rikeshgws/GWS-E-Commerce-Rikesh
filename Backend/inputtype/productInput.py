import strawberry
from typing import List, Optional

@strawberry.input
class ProductInput:
    product_name: str
    company_name: str
    description: str
    category: str
    price: float
    stock: int
    images: Optional[List[str]] = None  # Base64 images

@strawberry.input
class ProductUpdateInput:
    product_id: int
    product_name: Optional[str] = None
    company_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None  # Base64 images

@strawberry.input
class UpdateStockInput:
    product_id: int
    quantity: int