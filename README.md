## Task Management API

FastAPI service that lets you register users and manage tasks (create, read, update, delete) backed by a SQL database via SQLAlchemy.

### Features

- User registration with hashed passwords
- Task CRUD with completion flag
- OpenAPI docs at `/docs` and `/redoc`
- Environment-driven database configuration

### Tech Stack

- FastAPI
- SQLAlchemy ORM
- Pydantic models for request/response validation
- pwdlib for secure password hashing

### Project Layout

```
task_management_app/
├── main.py                # FastAPI application entrypoint
├── requirements.txt       # Python dependencies
├── src/
│   ├── tasks/             # Task domain (router, controller, models, dtos)
│   ├── users/             # User domain (router, controller, models, dtos)
│   └── utils/             # DB setup and settings loader
└── .env                   # Local environment variables (not committed)
```

### Getting Started

1. Clone the repository and change into the folder.
2. (Recommended) Create and activate a virtual environment:

```bash
python -m venv env
env\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure your database connection string in a `.env` file:

```ini
DB_CONNECTION=sqlite:///./task.db
```

- Any SQLAlchemy-compatible URL works (PostgreSQL, MySQL, etc.).

5. Start the API:

```bash
uvicorn main:app --reload
```

6. Open API docs at `http://127.0.0.1:8000/docs`.

### API Overview

Base path prefixes are applied per router.

#### Users (`/user`)

- POST `/register` — Create a user (body: `name`, `username`, `password`, `email`)
- DELETE `/delete/{id}` — Remove a user by id

#### Tasks (`/tasks`)

- POST `/create` — Create a task (body: `title`, `description`, `is_completed` default false)
- GET `/all_tasks` — List all tasks
- GET `/one_task/{task_id}` — Fetch one task by id
- PUT `/update_task/{task_id}` — Update a task (same body as create)
- DELETE `/delete_task/{task_id}` — Delete a task by id

### Request/Response Schemas

- Task: title (str), description (str), is_completed (bool, default false)
- User: name (str), username (str), password (str), email (str)

### Notes

- Database tables are created automatically on startup via SQLAlchemy metadata.
- Passwords are stored as secure hashes using pwdlib; no login endpoint exists yet.
- Add tests, validation, and auth before production use.
