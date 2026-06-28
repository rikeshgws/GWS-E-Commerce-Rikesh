from config.database import SessionLocal
from models.models import User
from utils.helper import (
    hash_password, verify_password, create_access_token,
    validate_email, validate_phone
)
from inputtype.common import GenericResponse
from sqlalchemy.exc import IntegrityError
import json

async def buyer_register_resolver(input, context):
    db = SessionLocal()
    try:
        if not validate_email(input.email):
            return GenericResponse(success=False, message="Invalid email format")
        
        if not validate_phone(input.phone):
            return GenericResponse(success=False, message="Invalid phone number")
        
        if len(input.password) < 6:
            return GenericResponse(success=False, message="Password must be at least 6 characters")
        
        existing = db.query(User).filter(User.email == input.email).first()
        if existing:
            return GenericResponse(success=False, message="Email already registered")
        
        hashed_password = hash_password(input.password)
        user = User(
            name=input.name,
            email=input.email,
            password=hashed_password,
            phone=input.phone,
            address=input.address,
            role="Buyer",
            status="active"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        token = create_access_token({"user_id": user.id, "role": user.role})
        
        data = json.dumps({"token": token, "user_id": user.id, "role": user.role})
        return GenericResponse(
            success=True,
            message="Buyer registered successfully",
            data=data
        )
    except IntegrityError:
        db.rollback()
        return GenericResponse(success=False, message="Email already registered")
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Registration failed: {str(e)}")
    finally:
        db.close()

async def seller_register_resolver(input, context):
    db = SessionLocal()
    try:
        if not validate_email(input.email):
            return GenericResponse(success=False, message="Invalid email format")
        
        if not validate_phone(input.phone):
            return GenericResponse(success=False, message="Invalid phone number")
        
        if len(input.password) < 6:
            return GenericResponse(success=False, message="Password must be at least 6 characters")
        
        existing = db.query(User).filter(User.email == input.email).first()
        if existing:
            return GenericResponse(success=False, message="Email already registered")
        
        hashed_password = hash_password(input.password)
        user = User(
            name=input.name,
            email=input.email,
            password=hashed_password,
            phone=input.phone,
            address=input.address,
            role="Seller",
            status="active"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        token = create_access_token({"user_id": user.id, "role": user.role})
        
        data = json.dumps({"token": token, "user_id": user.id, "role": user.role})
        return GenericResponse(
            success=True,
            message="Seller registered successfully",
            data=data
        )
    except IntegrityError:
        db.rollback()
        return GenericResponse(success=False, message="Email already registered")
    except Exception as e:
        db.rollback()
        return GenericResponse(success=False, message=f"Registration failed: {str(e)}")
    finally:
        db.close()

async def login_resolver(input, context):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == input.email).first()
        if not user:
            return GenericResponse(success=False, message="Invalid email or password")
        
        if user.status == "inactive":
            return GenericResponse(success=False, message="Account is disabled")
        
        if not verify_password(input.password, user.password):
            return GenericResponse(success=False, message="Invalid email or password")
        
        token = create_access_token({"user_id": user.id, "role": user.role})
        
        data = json.dumps({"token": token, "user_id": user.id, "role": user.role})
        return GenericResponse(
            success=True,
            message="Login successful",
            data=data
        )
    except Exception as e:
        return GenericResponse(success=False, message=f"Login failed: {str(e)}")
    finally:
        db.close()
