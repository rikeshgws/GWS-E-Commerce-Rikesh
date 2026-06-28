from config.database import SessionLocal
from models.models import User, Product, Order
from utils.helper import get_current_user, is_buyer
from inputtype.common import GenericResponse
from fastapi import HTTPException
import json

async def buyer_profile_resolver(context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return GenericResponse(success=False, message="User not found")
        
        if not is_buyer(user.role):
            return GenericResponse(success=False, message="Access denied. Buyer only.")
        
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

async def buyer_update_profile_resolver(input, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return GenericResponse(success=False, message="User not found")
        
        if not is_buyer(user.role):
            return GenericResponse(success=False, message="Access denied. Buyer only.")
        
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

async def buyer_orders_resolver(context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return GenericResponse(success=False, message="User not found")
        
        if not is_buyer(user.role):
            return GenericResponse(success=False, message="Access denied. Buyer only.")
        
        orders = db.query(Order).filter(Order.buyer_id == user.id).all()
        
        orders_data = []
        for order in orders:
            product = db.query(Product).filter(Product.id == order.product_id).first()
            seller = db.query(User).filter(User.id == order.seller_id).first()
            
            orders_data.append({
                "id": order.id,
                "product_name": product.product_name if product else "Unknown",
                "seller_name": seller.name if seller else "Unknown",
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

async def order_product_resolver(input, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        buyer = db.query(User).filter(User.id == user_id).first()
        
        if not buyer:
            return GenericResponse(success=False, message="User not found")
        
        if not is_buyer(buyer.role):
            return GenericResponse(success=False, message="Only buyers can place orders")
        
        product = db.query(Product).filter(Product.id == input.product_id).first()
        if not product:
            return GenericResponse(success=False, message="Product not found")
        
        if product.stock < input.quantity:
            return GenericResponse(success=False, message="Insufficient stock available")
        
        if product.seller_id == buyer.id:
            return GenericResponse(success=False, message="Cannot order your own product")
        
        total_price = product.price * input.quantity
        
        order = Order(
            buyer_id=buyer.id,
            seller_id=product.seller_id,
            product_id=product.id,
            quantity=input.quantity,
            total_price=total_price,
            status="Pending"
        )
        
        product.stock -= input.quantity
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        data = json.dumps({
            "order_id": order.id,
            "total_price": total_price,
            "status": order.status
        })
        return GenericResponse(
            success=True,
            message="Order placed successfully",
            data=data
        )
    except HTTPException as e:
        db.rollback()
        return GenericResponse(success=False, message=str(e.detail))
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Order failed: {str(e)}")
    finally:
        db.close()

async def cancel_order_resolver(input, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        buyer = db.query(User).filter(User.id == user_id).first()
        
        if not buyer:
            return GenericResponse(success=False, message="User not found")
        
        if not is_buyer(buyer.role):
            return GenericResponse(success=False, message="Only buyers can cancel orders")
        
        order = db.query(Order).filter(Order.id == input.order_id).first()
        if not order:
            return GenericResponse(success=False, message="Order not found")
        
        if order.buyer_id != buyer.id:
            return GenericResponse(success=False, message="This order does not belong to you")
        
        if order.status != "Pending":
            return GenericResponse(success=False, message="Only pending orders can be cancelled")
        
        product = db.query(Product).filter(Product.id == order.product_id).first()
        if product:
            product.stock += order.quantity
        
        order.status = "Cancelled"
        order.cancel_reason = input.cancel_reason
        
        db.commit()
        
        return GenericResponse(success=True, message="Order cancelled successfully")
    except HTTPException as e:
        db.rollback()
        return GenericResponse(success=False, message=str(e.detail))
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Cancellation failed: {str(e)}")
    finally:
        db.close()

async def mark_delivered_resolver(order_id, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        buyer = db.query(User).filter(User.id == user_id).first()
        
        if not buyer:
            return GenericResponse(success=False, message="User not found")
        
        if not is_buyer(buyer.role):
            return GenericResponse(success=False, message="Only buyers can mark delivered")
        
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return GenericResponse(success=False, message="Order not found")
        
        if order.buyer_id != buyer.id:
            return GenericResponse(success=False, message="This order does not belong to you")
        
        if order.status != "Pending":
            return GenericResponse(success=False, message="Only pending orders can be marked delivered")
        
        order.status = "Delivered"
        
        db.commit()
        
        return GenericResponse(success=True, message="Order marked as delivered")
    except HTTPException as e:
        db.rollback()
        return GenericResponse(success=False, message=str(e.detail))
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Failed to mark delivered: {str(e)}")
    finally:
        db.close()