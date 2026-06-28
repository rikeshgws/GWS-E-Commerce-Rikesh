import strawberry
from strawberry.types import Info
from inputtype.orderInput import OrderInput
from inputtype.buyerInput import CancelOrderInput
from inputtype.common import GenericResponse
from resolvers.orderResolver import (
    get_buyer_orders_resolver,
    get_seller_orders_resolver,
    place_order_resolver,
    cancel_order_resolver,
    mark_order_delivered_resolver
)

@strawberry.type
class OrderQuery:
    @strawberry.field
    async def buyer_orders(self, info: Info) -> GenericResponse:
        return await get_buyer_orders_resolver(info.context)

    @strawberry.field
    async def seller_orders(self, info: Info) -> GenericResponse:
        return await get_seller_orders_resolver(info.context)

@strawberry.type
class OrderMutation:
    @strawberry.mutation
    async def place_order(
        self,
        input: OrderInput,
        info: Info
    ) -> GenericResponse:
        return await place_order_resolver(input, info.context)

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
        return await mark_order_delivered_resolver(order_id, info.context)