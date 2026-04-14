from src.tasks.dtos import TaskSchema
from sqlalchemy.orm  import Session
from src.tasks.models import TaskModel
from fastapi import HTTPException
from src.users.models import UserModel



def create_task(body: TaskSchema, db:Session, user:UserModel):
    data = body.model_dump()
    new_task = TaskModel(title = data["title"], 
                         description = data["description"], 
                         is_completed = data["is_completed"], 
                         user_id = user.id
                         )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


def get_task(db:Session, user:UserModel):
    tasks = db.query(TaskModel).filter(TaskModel.user_id == user.id).all()
    return {"status": "All Tasks", "data": tasks}



def get_one_task(id:int, db:Session):
    one_task = db.query(TaskModel).get(id)
    if not one_task:
        raise HTTPException(404, detail="Task id is Incorrect")
    return {
        "status":"Task Fetched Successfully", "Data":one_task
    }

def update_task(id:int, body:TaskSchema, db:Session, user:UserModel):
    one_task:TaskModel = db.query(TaskModel).get(id)
    if not one_task:
        raise HTTPException(404, detail="Task id is Incorrect")
    
    if one_task.user_id != user.id:
        raise HTTPException(404, detail="You are not allowed to update this task")

    body = body.model_dump()
    for field, value in body.items():
        setattr(one_task, field, value)

    db.add(one_task)
    db.commit()
    db.refresh(one_task)

    return {
        "Status": "Task Updated Successfully", "Data": one_task
    }


def delete_task(id:int, db:Session, user:UserModel):
    one_task:TaskModel = db.query(TaskModel).get(id)
    if not one_task:
        raise HTTPException(404, detail="Task id is not Correct")
    
    if one_task.user_id != user.id:
        raise HTTPException(404, detail="You are not allowed to Delete this task")
    
    db.delete(one_task)
    db.commit()

    return None  