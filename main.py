from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from src.utils.db import Base, engine
from src.tasks.router import task_routes
from src.users.router import user_routes
import uvicorn
import os

Base.metadata.create_all(engine)

app = FastAPI(
    title="This is my Task management Applicaiton",
    description="Full-stack Task Management API with Authentication",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directory exists and mount static files
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include Routers
app.include_router(task_routes)
app.include_router(user_routes)

# Serve Frontend on root
@app.get("/", include_in_schema=False)
def serve_frontend():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )

