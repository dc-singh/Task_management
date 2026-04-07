from src.users.dtos import UserSchema
from sqlalchemy.orm import Session
from src.users.dtos import UserSchema, loginSchema
from src.users.models import UserModel
from fastapi import HTTPException, status, Request
from pwdlib import PasswordHash
import jwt
from jwt import InvalidTokenError
from src.utils.settings import Settings
from datetime import datetime, timedelta, timezone

password_hash = PasswordHash.recommended()


def get_password_hash(password):
    return password_hash.hash(password)

def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def register(body: UserSchema, db:Session):
    is_user = db.query(UserModel).filter(UserModel.username == body.username).first()
    if is_user:
        raise HTTPException(400, detail= "Username Already Exist.....")
    
    is_email = db.query(UserModel).filter(UserModel.email == body.email).first()
    if is_email:
        raise HTTPException(400, detail="Email Address Already Exist.....")
    

    hash_password = get_password_hash(body.password)

    new_user = UserModel(
        name = body.name,
        username = body.username,
        hash_password = hash_password,
        email = body.email,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def login_user(body:loginSchema, db:Session):
    user = db.query(UserModel).filter(UserModel.username == body.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You entered wrong username")
    
    if not verify_password(body.password, user.hash_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You entered wrong password")
    
    exp_time = datetime.now(timezone.utc) + timedelta(minutes=Settings.EXP_TIME)

    token = jwt.encode({"_id":user.id, "exp":exp_time}, Settings.SECRET_KEY, Settings.ALGORITHM)
    return {"token":token}


def is_authenticated(request: Request, db:Session):
    try:
        token = request.headers.get("authorization")
        if not token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You are unauthorised")
        token = token.split(" ")[-1]
        data = jwt.decode(token, Settings.SECRET_KEY, Settings.ALGORITHM)
        
        user_id = data.get("_id")
        exp_time = data.get("exp")
        curr_time = datetime.now().timestamp()

        if curr_time > exp_time:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "You are unauthorised")
        
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "You are unauthorised")

        return user
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You are unauthorised")




def delete_user(id:int, db:Session):
    user = db.query(UserModel).filter(UserModel.id == id).first()
    if not user:
        raise HTTPException(204, detail="Not user Found......")
    
    db.delete(user)
    db.commit()
