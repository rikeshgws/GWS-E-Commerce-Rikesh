import os
import shutil
import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, UploadFile
import uuid
import re
import json
import base64

SECRET_KEY = "SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_user_from_token(token: str):
    """Get user_id and role from token"""
    payload = verify_token(token)
    if payload:
        return {
            "user_id": payload.get("user_id"),
            "role": payload.get("role")
        }
    return None

def get_current_user(context):
    """Get current user from context"""
    user_id = context.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id

def get_current_user_role(context):
    """Get current user role from context"""
    return context.get('user_role')

def create_folder(folder_path: str):
    os.makedirs(folder_path, exist_ok=True)

def delete_product_folder(product_name: str):
    folder_path = f"templates/static/products/{product_name}"
    if os.path.exists(folder_path):
        try:
            shutil.rmtree(folder_path)
        except:
            pass

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone: str) -> bool:
    return len(phone) >= 10 and phone.isdigit()

def is_seller(role: str) -> bool:
    return role.lower() == "seller"

def is_buyer(role: str) -> bool:
    return role.lower() == "buyer"

def format_response(success: bool, message: str, data: dict = None):
    response = {"success": success, "message": message}
    if data:
        response["data"] = json.dumps(data)
    return response
