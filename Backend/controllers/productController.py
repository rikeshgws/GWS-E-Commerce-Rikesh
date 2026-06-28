import strawberry
from strawberry.types import Info
from inputtype.productInput import ProductInput, ProductUpdateInput, UpdateStockInput
from inputtype.common import GenericResponse
from resolvers.productResolver import (
    all_products_resolver,
    product_detail_resolver,
    add_product_resolver,
    update_product_resolver,
    delete_product_resolver,
    update_stock_resolver
)

@strawberry.type
class ProductQuery:
    @strawberry.field
    async def all_products(self, info: Info) -> GenericResponse:
        return await all_products_resolver(info.context)

    @strawberry.field
    async def product_detail(self, product_id: int, info: Info) -> GenericResponse:
        return await product_detail_resolver(product_id, info.context)

@strawberry.type
class ProductMutation:
    @strawberry.mutation
    async def add_product(
        self,
        input: ProductInput,
        info: Info
    ) -> GenericResponse:
        return await add_product_resolver(input, info.context)

    @strawberry.mutation
    async def update_product(
        self,
        input: ProductUpdateInput,
        info: Info
    ) -> GenericResponse:
        return await update_product_resolver(input, info.context)

    @strawberry.mutation
    async def delete_product(
        self,
        product_id: int,
        info: Info
    ) -> GenericResponse:
        return await delete_product_resolver(product_id, info.context)

    @strawberry.mutation
    async def update_stock(
        self,
        input: UpdateStockInput,
        info: Info
    ) -> GenericResponse:
        return await update_stock_resolver(input, info.context)