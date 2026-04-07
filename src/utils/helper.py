from fastapi import Request, HTTPException, status, Depends
from src.utils.settings import Settings
from sqlalchemy.orm import Session
from jwt.exceptions import InvalidTokenError
from src.users.models import UserModel
import jwt
from datetime import datetime
from src.utils.db import get_db


def is_authenticated(request: Request, db:Session = Depends(get_db)):
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



