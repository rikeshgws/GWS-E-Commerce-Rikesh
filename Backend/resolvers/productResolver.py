from config.database import SessionLocal
from models.models import User, Product
from utils.helper import get_current_user, is_seller, delete_product_folder
from inputtype.common import GenericResponse
from fastapi import HTTPException
import json
import base64
import os
import uuid

async def save_base64_images_to_disk(images: list, product_name: str) -> list:
    """Save Base64 images to disk and return paths"""
    base_dir = "templates/static/products"
    product_folder = os.path.join(base_dir, product_name)
    os.makedirs(product_folder, exist_ok=True)
    
    saved_paths = []
    for idx, image_data in enumerate(images):
        try:
            if image_data.startswith('data:image'):
                header, base64_str = image_data.split(';base64,')
                ext = header.split('/')[1] if '/' in header else 'png'
            else:
                base64_str = image_data
                ext = 'png'
            
            image_bytes = base64.b64decode(base64_str)
            
            filename = f"{product_name}_{uuid.uuid4().hex[:8]}.{ext}"
            file_path = os.path.join(product_folder, filename)
            with open(file_path, 'wb') as f:
                f.write(image_bytes)
            
            saved_paths.append(f"templates/static/products/{product_name}/{filename}")
        except Exception as e:
            print(f"Error saving image: {e}")
            continue
    
    return saved_paths

async def all_products_resolver(context):
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        
        products_data = []
        for product in products:
            seller = db.query(User).filter(User.id == product.seller_id).first()
            products_data.append({
                "id": product.id,
                "product_name": product.product_name,
                "company_name": product.company_name,
                "description": product.description,
                "category": product.category,
                "price": product.price,
                "stock": product.stock,
                "images": product.images,
                "seller_name": seller.name if seller else "Unknown",
                "created_at": product.created_at.isoformat() if product.created_at else None
            })
        
        data = json.dumps({"products": products_data})
        return GenericResponse(
            success=True,
            message="Products fetched successfully",
            data=data
        )
    except Exception as e:
        return GenericResponse(success=False, message=f"Failed to fetch products: {str(e)}")
    finally:
        db.close()

async def product_detail_resolver(product_id, context):
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return GenericResponse(success=False, message="Product not found")
        
        seller = db.query(User).filter(User.id == product.seller_id).first()
        
        product_data = {
            "id": product.id,
            "product_name": product.product_name,
            "company_name": product.company_name,
            "description": product.description,
            "category": product.category,
            "price": product.price,
            "stock": product.stock,
            "images": product.images,
            "seller_name": seller.name if seller else "Unknown",
            "created_at": product.created_at.isoformat() if product.created_at else None
        }
        
        data = json.dumps({"product": product_data})
        return GenericResponse(
            success=True,
            message="Product details fetched",
            data=data
        )
    except Exception as e:
        return GenericResponse(success=False, message=f"Failed to fetch product: {str(e)}")
    finally:
        db.close()

async def add_product_resolver(input, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        seller = db.query(User).filter(User.id == user_id).first()
        
        if not seller:
            return GenericResponse(success=False, message="User not found")
        
        if not is_seller(seller.role):
            return GenericResponse(success=False, message="Only sellers can add products")
        
        product = Product(
            seller_id=seller.id,
            company_name=input.company_name,
            product_name=input.product_name,
            description=input.description,
            category=input.category,
            price=input.price,
            stock=input.stock,
            images=input.images if input.images else []
        )
        
        if input.images:
            await save_base64_images_to_disk(input.images, input.product_name)
        
        db.add(product)
        db.commit()
        db.refresh(product)
        
        data = json.dumps({"product_id": product.id})
        return GenericResponse(
            success=True,
            message="Product added successfully",
            data=data
        )
    except HTTPException as e:
        db.rollback()
        return GenericResponse(success=False, message=str(e.detail))
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Failed to add product: {str(e)}")
    finally:
        db.close()

async def update_product_resolver(input, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        seller = db.query(User).filter(User.id == user_id).first()
        
        if not seller:
            return GenericResponse(success=False, message="User not found")
        
        if not is_seller(seller.role):
            return GenericResponse(success=False, message="Only sellers can update products")
        
        product = db.query(Product).filter(Product.id == input.product_id).first()
        if not product:
            return GenericResponse(success=False, message="Product not found")
        
        if product.seller_id != seller.id:
            return GenericResponse(success=False, message="You don't own this product")
        
        if input.product_name:
            product.product_name = input.product_name
        if input.company_name:
            product.company_name = input.company_name
        if input.description:
            product.description = input.description
        if input.category:
            product.category = input.category
        if input.price:
            product.price = input.price
        if input.stock is not None:
            product.stock = input.stock
        if input.images is not None:
            product.images = input.images
            if input.images:
                await save_base64_images_to_disk(input.images, product.product_name)
        
        db.commit()
        db.refresh(product)
        
        return GenericResponse(success=True, message="Product updated successfully")
    except HTTPException as e:
        db.rollback()
        return GenericResponse(success=False, message=str(e.detail))
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Failed to update product: {str(e)}")
    finally:
        db.close()

async def delete_product_resolver(product_id, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        seller = db.query(User).filter(User.id == user_id).first()
        
        if not seller:
            return GenericResponse(success=False, message="User not found")
        
        if not is_seller(seller.role):
            return GenericResponse(success=False, message="Only sellers can delete products")
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return GenericResponse(success=False, message="Product not found")
        
        if product.seller_id != seller.id:
            return GenericResponse(success=False, message="You don't own this product")
        
        delete_product_folder(product.product_name)
        
        db.delete(product)
        db.commit()
        
        return GenericResponse(success=True, message="Product deleted successfully")
    except HTTPException as e:
        db.rollback()
        return GenericResponse(success=False, message=str(e.detail))
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Failed to delete product: {str(e)}")
    finally:
        db.close()

async def update_stock_resolver(input, context):
    db = SessionLocal()
    try:
        user_id = get_current_user(context)
        seller = db.query(User).filter(User.id == user_id).first()
        
        if not seller:
            return GenericResponse(success=False, message="User not found")
        
        if not is_seller(seller.role):
            return GenericResponse(success=False, message="Only sellers can update stock")
        
        product = db.query(Product).filter(Product.id == input.product_id).first()
        if not product:
            return GenericResponse(success=False, message="Product not found")
        
        if product.seller_id != seller.id:
            return GenericResponse(success=False, message="You don't own this product")
        
        product.stock = input.quantity
        db.commit()
        db.refresh(product)
        
        return GenericResponse(success=True, message="Stock updated successfully")
    except HTTPException as e:
        db.rollback()
        return GenericResponse(success=False, message=str(e.detail))
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Failed to update stock: {str(e)}")
    finally:
        db.close()
