import strawberry

@strawberry.input
class BuyerRegisterInput:
    name: str
    email: str
    password: str
    phone: str
    address: str

@strawberry.input
class SellerRegisterInput:
    name: str
    email: str
    password: str
    phone: str
    address: str

@strawberry.input
class LoginInput:
    email: str
    password: str