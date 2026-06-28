from config.database import SessionLocal
from models.models import User, Product, Order
from utils.helper import get_current_user, is_seller
from inputtype.common import GenericResponse
from fastapi import HTTPException
import json

async def seller_profile_resolver(context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return GenericResponse(success=False, message="User not found")
        
        if not is_seller(user.role):
            return GenericResponse(success=False, message="Access denied. Seller only.")
        
        data = json.dumps({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "role": user.role
        })
        return GenericResponse(
            success=True,
            message="Profile fetched successfully",
            data=data
        )
    except HTTPException as e:
        return GenericResponse(success=False, message=str(e.detail))
    finally:
        db.close()

async def seller_update_profile_resolver(input, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return GenericResponse(success=False, message="User not found")
        
        if not is_seller(user.role):
            return GenericResponse(success=False, message="Access denied. Seller only.")
        
        if input.name:
            user.name = input.name
        if input.phone:
            user.phone = input.phone
        if input.address:
            user.address = input.address
        
        db.commit()
        db.refresh(user)
        
        return GenericResponse(success=True, message="Profile updated successfully")
    except HTTPException as e:
        return GenericResponse(success=False, message=str(e.detail))
    finally:
        db.close()

async def seller_products_resolver(context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        seller = db.query(User).filter(User.id == user_id).first()
        
        if not seller:
            return GenericResponse(success=False, message="User not found")
        
        if not is_seller(seller.role):
            return GenericResponse(success=False, message="Access denied. Seller only.")
        
        products = db.query(Product).filter(Product.seller_id == seller.id).all()
        
        products_data = []
        for product in products:
            products_data.append({
                "id": product.id,
                "product_name": product.product_name,
                "company_name": product.company_name,
                "description": product.description,
                "category": product.category,
                "price": product.price,
                "stock": product.stock,
                "images": product.images,
                "created_at": product.created_at.isoformat() if product.created_at else None
            })
        
        data = json.dumps({"products": products_data})
        return GenericResponse(
            success=True,
            message="Products fetched successfully",
            data=data
        )
    except HTTPException as e:
        return GenericResponse(success=False, message=str(e.detail))
    finally:
        db.close()

async def seller_orders_resolver(context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        seller = db.query(User).filter(User.id == user_id).first()
        
        if not seller:
            return GenericResponse(success=False, message="User not found")
        
        if not is_seller(seller.role):
            return GenericResponse(success=False, message="Access denied. Seller only.")
        
        orders = db.query(Order).filter(Order.seller_id == seller.id).all()
        
        orders_data = []
        for order in orders:
            buyer = db.query(User).filter(User.id == order.buyer_id).first()
            product = db.query(Product).filter(Product.id == order.product_id).first()
            
            orders_data.append({
                "id": order.id,
                "buyer_name": buyer.name if buyer else "Unknown",
                "product_name": product.product_name if product else "Unknown",
                "quantity": order.quantity,
                "total_price": float(order.total_price),
                "status": order.status,
                "cancel_reason": order.cancel_reason,
                "created_at": order.created_at.isoformat() if order.created_at else None
            })
        
        data = json.dumps({"orders": orders_data})
        return GenericResponse(
            success=True,
            message="Orders fetched successfully",
            data=data
        )
    except HTTPException as e:
        return GenericResponse(success=False, message=str(e.detail))
    finally:
        db.close()