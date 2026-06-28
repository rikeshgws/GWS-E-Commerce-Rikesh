import strawberry
from strawberry.types import Info
from inputtype.sellerInput import SellerUpdateInput
from inputtype.common import GenericResponse
from resolvers.sellerResolver import (
    seller_profile_resolver,
    seller_update_profile_resolver,
    seller_products_resolver,
    seller_orders_resolver
)

@strawberry.type
class SellerQuery:
    @strawberry.field
    async def seller_profile(self, info: Info) -> GenericResponse:
        return await seller_profile_resolver(info.context)

    @strawberry.field
    async def seller_products(self, info: Info) -> GenericResponse:
        return await seller_products_resolver(info.context)

    @strawberry.field
    async def seller_orders(self, info: Info) -> GenericResponse:
        return await seller_orders_resolver(info.context)

@strawberry.type
class SellerMutation:
    @strawberry.mutation
    async def seller_update_profile(
        self,
        input: SellerUpdateInput,
        info: Info
    ) -> GenericResponse:
        return await seller_update_profile_resolver(input, info.context)