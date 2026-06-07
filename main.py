from fastapi import FastAPI
from src.utils.db import Base, engine
from src.tasks.router import task_routes
from src.users.router import user_routes
import uvicorn
import os


Base.metadata.create_all(engine)

app = FastAPI(title = "This is my Task management Applicaiton")
app.include_router(task_routes)
app.include_router(user_routes)



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port
    )
