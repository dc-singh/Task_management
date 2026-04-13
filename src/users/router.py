from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from src.users.dtos import UserSchema, UserResponseSchema, loginSchema
from src.utils.db import get_db
from src.users import controller

user_routes = APIRouter(prefix="/user")

@user_routes.post("/register",response_model=UserResponseSchema ,status_code=status.HTTP_201_CREATED)
def  register(body: UserSchema, db:Session=Depends(get_db)):
    # print(body)
    return controller.register(body, db)

@user_routes.post("/login", status_code=status.HTTP_200_OK)
def login_user(body:loginSchema, db:Session=Depends(get_db)):
    return controller.login_user(body, db)

@user_routes.get("/is_auth",response_model=UserResponseSchema, status_code=status.HTTP_200_OK)
def is_authenticated(request: Request, db:Session=Depends(get_db)):
    return controller.is_authenticated(request, db)


@user_routes.delete("/delete/{id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_user(id:int, db:Session=Depends(get_db)):
    return controller.delete_user(id, db)