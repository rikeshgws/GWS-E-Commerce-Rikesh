import strawberry
from strawberry.types import Info
from inputtype.buyerInput import BuyerUpdateInput, CancelOrderInput
from inputtype.orderInput import OrderInput
from inputtype.common import GenericResponse
from resolvers.buyerResolver import (
    buyer_profile_resolver,
    buyer_update_profile_resolver,
    buyer_orders_resolver,
    order_product_resolver,
    cancel_order_resolver,
    mark_delivered_resolver
)

@strawberry.type
class BuyerQuery:
    @strawberry.field
    async def buyer_profile(self, info: Info) -> GenericResponse:
        return await buyer_profile_resolver(info.context)

    @strawberry.field
    async def buyer_orders(self, info: Info) -> GenericResponse:
        return await buyer_orders_resolver(info.context)

@strawberry.type
class BuyerMutation:
    @strawberry.mutation
    async def buyer_update_profile(
        self,
        input: BuyerUpdateInput,
        info: Info
    ) -> GenericResponse:
        return await buyer_update_profile_resolver(input, info.context)

    @strawberry.mutation
    async def order_product(
        self,
        input: OrderInput,
        info: Info
    ) -> GenericResponse:
        return await order_product_resolver(input, info.context)

    @strawberry.mutation
    async def cancel_order(
        self,
        input: CancelOrderInput,
        info: Info
    ) -> GenericResponse:
        return await cancel_order_resolver(input, info.context)

    @strawberry.mutation
    async def mark_delivered(
        self,
        order_id: int,
        info: Info
    ) -> GenericResponse:
        return await mark_delivered_resolver(order_id, info.context)