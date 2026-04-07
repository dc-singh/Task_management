from fastapi import APIRouter, Depends, status
from src.tasks import controller
from src.tasks.dtos import TaskSchema, TaskResponseSchema
from src.utils.db import get_db
from src.utils.helper import is_authenticated
from src.users.models import UserModel

task_routes = APIRouter(prefix="/tasks")


@task_routes.post("/create", response_model=TaskResponseSchema ,status_code=status.HTTP_201_CREATED)
def create_task(body:TaskSchema, db = Depends(get_db), user: UserModel = Depends(is_authenticated)):
    return controller.create_task(body, db)

@task_routes.get("/all_tasks", status_code=status.HTTP_200_OK)
def get_all_tasks(db = Depends(get_db),user: UserModel = Depends(is_authenticated)):
    return controller.get_task(db)


@task_routes.get("/one_task/{task_id}", status_code=status.HTTP_200_OK)
def get_one_task(task_id:int, db = Depends(get_db), user: UserModel = Depends(is_authenticated)):
    return controller.get_one_task(task_id, db)


@task_routes.put("/update_task/{task_id}", status_code=status.HTTP_202_ACCEPTED)
def update_task(task_id: int, body: TaskSchema, db = Depends(get_db), user: UserModel = Depends(is_authenticated)):
    # Pass path param first to match controller signature
    return controller.update_task(task_id, body, db)

@task_routes.delete("/delete_task/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db = Depends(get_db), user: UserModel = Depends(is_authenticated)):
    return controller.delete_task(task_id, db)