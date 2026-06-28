import strawberry
from strawberry.types import Info
from inputtype.authInput import BuyerRegisterInput, SellerRegisterInput, LoginInput
from inputtype.common import GenericResponse
from resolvers.authResolver import (
    buyer_register_resolver,
    seller_register_resolver,
    login_resolver
)

@strawberry.type
class AuthMutation:
    @strawberry.mutation
    async def buyer_register(
        self,
        input: BuyerRegisterInput,
        info: Info
    ) -> GenericResponse:
        return await buyer_register_resolver(input, info.context)

    @strawberry.mutation
    async def seller_register(
        self,
        input: SellerRegisterInput,
        info: Info
    ) -> GenericResponse:
        return await seller_register_resolver(input, info.context)

    @strawberry.mutation
    async def login(
        self,
        input: LoginInput,
        info: Info
    ) -> GenericResponse:
        return await login_resolver(input, info.context)
    
    