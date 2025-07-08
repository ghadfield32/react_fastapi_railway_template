from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from pathlib import Path
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FastAPI + React App",
    description="A full-stack application with FastAPI backend and React frontend",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
origins = [
    "http://localhost:3000",  # React development server (Create React App)
    "http://localhost:5173",  # React development server (Vite)
    "http://localhost:5174",  # Alternative Vite port
    "https://localhost:3000",
    "https://localhost:5173",
]

# Add Railway domains and environment-specific origins
if os.getenv("RAILWAY_ENVIRONMENT"):
    # Add Railway deployment URL
    railway_url = os.getenv("RAILWAY_PUBLIC_DOMAIN")
    if railway_url:
        origins.extend([
            f"https://{railway_url}",
            f"http://{railway_url}"
        ])

# Add custom frontend URL from environment
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

# In development, allow all origins
if os.getenv("ENVIRONMENT") == "development":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

class PredictionRequest(BaseModel):
    data: Dict[str, Any]

class PredictionResponse(BaseModel):
    prediction: Any
    confidence: float
    model_version: str

# API Routes
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for Railway and monitoring"""
    return HealthResponse(
        status="healthy",
        message="FastAPI backend is running",
        version="1.0.0"
    )

@app.get("/api/ping")
async def ping():
    """Simple ping endpoint"""
    return {"message": "pong"}

@app.get("/api/hello")
async def hello():
    """Hello endpoint for React frontend to test API connection"""
    return {"message": "Hello from FastAPI backend!"}

@app.get("/api/info")
async def get_info():
    """Get application information"""
    return {
        "app_name": "FastAPI + React App",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "railway_environment": os.getenv("RAILWAY_ENVIRONMENT"),
        "python_version": os.getenv("PYTHON_VERSION", "3.10")
    }

@app.post("/api/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Example prediction endpoint
    Replace this with your actual ML model logic
    """
    try:
        # Placeholder prediction logic
        # In a real app, you'd load your model and make predictions
        prediction_result = {
            "prediction": "sample_prediction",
            "confidence": 0.95,
            "model_version": "v1.0.0"
        }
        
        logger.info(f"Prediction request: {request.data}")
        logger.info(f"Prediction result: {prediction_result}")
        
        return PredictionResponse(**prediction_result)
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Static files serving for React app
# Check if frontend build exists
frontend_build_path = Path("frontend/dist")
if frontend_build_path.exists():
    # Mount static files
    app.mount("/static", StaticFiles(directory="frontend/dist/assets"), name="static")
    
    # Serve React app for all other routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """
        Serve React app for all non-API routes
        This enables client-side routing
        """
        # Don't serve React app for API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Serve index.html for all other routes
        index_file = frontend_build_path / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        else:
            raise HTTPException(status_code=404, detail="Frontend not found")
else:
    logger.warning("Frontend build directory not found. React app will not be served.")
    
    @app.get("/")
    async def root():
        """Root endpoint when frontend is not built"""
        return {
            "message": "FastAPI backend is running",
            "docs": "/api/docs",
            "frontend_status": "not_built"
        }

# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return {"error": "Not found", "path": str(request.url)}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal server error: {exc}")
    return {"error": "Internal server error"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 