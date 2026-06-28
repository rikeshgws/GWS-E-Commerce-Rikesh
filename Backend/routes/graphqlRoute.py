from fastapi import APIRouter, Request
from strawberry.fastapi import GraphQLRouter
import strawberry

from controllers.authController import AuthMutation
from controllers.buyerController import BuyerQuery, BuyerMutation
from controllers.sellerController import SellerQuery, SellerMutation
from controllers.productController import ProductQuery, ProductMutation
from controllers.orderController import OrderQuery, OrderMutation
from utils.helper import verify_token

@strawberry.type
class Query(BuyerQuery, SellerQuery, ProductQuery, OrderQuery):
    pass

@strawberry.type
class Mutation(AuthMutation, BuyerMutation, SellerMutation, ProductMutation, OrderMutation):
    pass

async def get_context(request: Request):
    authorization = request.headers.get("Authorization", "")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else None
    
    user_id = None
    try:
        if token:
            payload = verify_token(token)
            if payload:
                user_id = payload.get("user_id")
    except Exception as e:
        print("JWT Error:", e)
        user_id = None
    
    return {
        "request": request,
        "token": token,
        "user_id": user_id
    }

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema, context_getter=get_context)

router = APIRouter()
router.include_router(graphql_app, prefix="/graphql")