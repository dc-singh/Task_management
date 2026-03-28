from src.users.dtos import UserSchema
from sqlalchemy.orm import Session
from src.users.dtos import UserSchema
from src.users.models import UserModel
from fastapi import HTTPException
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

def get_password_hash(password):
    return password_hash.hash(password)


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


def delete_user(id:int, db:Session):
    user = db.query(UserModel).filter(UserModel.id == id).first()
    if not user:
        raise HTTPException(204, detail="Not user Found......")
    
    db.delete(user)
    db.commit()