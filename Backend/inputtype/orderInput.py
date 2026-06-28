import strawberry

@strawberry.input
class OrderInput:
    product_id: int
    quantity: int