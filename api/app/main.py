import logging
import os
from fastapi import FastAPI, Request, Depends, BackgroundTasks, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
import time

from .db import lifespan, get_db
from .security import create_access_token, get_current_user, verify_password
from .crud import get_user_by_username

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global readiness flag - set to True after database is initialized
app_ready = False

# Pydantic models
class Payload(BaseModel):
    count: int

class PredictionRequest(BaseModel):
    data: Payload

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    input_received: Payload  # Echo back the input for verification

app = FastAPI(
    title="FastAPI + React App",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    swagger_ui_parameters={"persistAuthorization": True},
    lifespan=lifespan,  # register startup/shutdown events
)

# Configure CORS with environment-based origins
origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins: list[str] = [o.strip() for o in origins_env.split(",")] if origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Set readiness flag after startup is complete."""
    global app_ready
    logger.info("🚀 FastAPI application startup complete")
    logger.info(f"🏷  Runtime: Python {os.sys.version}")
    logger.info(f"🌐 Port: {os.getenv('PORT', '8000')}")
    logger.info(f"🔑 SECRET_KEY configured: {'Yes' if os.getenv('SECRET_KEY') else 'No (using generated key)'}")
    app_ready = True

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Measure request time and add X-Process-Time header."""
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers["X-Process-Time"] = f"{elapsed:.4f}"
    return response

@app.get("/api/health", status_code=status.HTTP_200_OK)
async def api_health() -> dict[str, t.Any]:
    """
    Lightweight readiness endpoint for Railway.  
    It does **not** touch the database – we only need to know that this worker
    finished startup.
    """
    return {
        "status": "healthy",
        "ready": True,          # start.sh guarantees DB was initialised
        "timestamp": time.time(),
        "service": "FastAPI + React Template"
    }


@app.get("/api/hello")
async def hello(current_user: str = Depends(get_current_user)):
    """Protected hello endpoint that returns a greeting."""
    return {"message": f"Hello {current_user}!"}

@app.post("/api/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user and issue JWT."""
    user = await get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = create_access_token(subject=user.username)
    return {"access_token": token, "token_type": "bearer"}

@app.post(
    "/api/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK
)
async def predict(
    request: PredictionRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Protected prediction endpoint with DB session & background auditing.

    Example request:
        {
            "data": {
                "count": 42
            }
        }
    """
    logger.info(f"User {current_user} called /predict with count={request.data.count}")

    # Mock prediction - replace with your actual ML model
    result = {
        "prediction": "sample",
        "confidence": 0.95,
        "input_received": request.data
    }

    # Background task for audit logging
    background_tasks.add_task(
        logger.info,
        f"[audit] user={current_user} input={request.data} output={result}"
    )

    return PredictionResponse(**result) 

