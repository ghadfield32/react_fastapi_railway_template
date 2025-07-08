from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
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
    "http://127.0.0.1:5173",  # Alternative localhost format
    "http://127.0.0.1:5174",  # Alternative localhost format
    "https://localhost:3000",
    "https://localhost:5173",
]

# Add Railway production URLs
railway_frontend_url = "https://react-frontend-production-2805.up.railway.app"
origins.append(railway_frontend_url)

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

# In development, allow all origins for easier debugging
if os.getenv("ENVIRONMENT") == "development" or not os.getenv("RAILWAY_ENVIRONMENT"):
    origins = ["*"]

# Log CORS configuration for debugging
logger.info(f"🔍 DEBUG: CORS origins configured: {origins}")
logger.info(f"🔍 DEBUG: RAILWAY_ENVIRONMENT: {os.getenv('RAILWAY_ENVIRONMENT')}")
logger.info(f"🔍 DEBUG: ENVIRONMENT: {os.getenv('ENVIRONMENT')}")
logger.info(f"🔍 DEBUG: FRONTEND_URL: {os.getenv('FRONTEND_URL')}")

# Add Railway-specific debugging
logger.info("🔍 DEBUG: === RAILWAY ENVIRONMENT ANALYSIS ===")
railway_vars = {
    'RAILWAY_ENVIRONMENT': os.getenv('RAILWAY_ENVIRONMENT'),
    'RAILWAY_PUBLIC_DOMAIN': os.getenv('RAILWAY_PUBLIC_DOMAIN'),
    'RAILWAY_PRIVATE_DOMAIN': os.getenv('RAILWAY_PRIVATE_DOMAIN'),
    'RAILWAY_SERVICE_NAME': os.getenv('RAILWAY_SERVICE_NAME'),
    'RAILWAY_DEPLOYMENT_ID': os.getenv('RAILWAY_DEPLOYMENT_ID'),
    'RAILWAY_PROJECT_ID': os.getenv('RAILWAY_PROJECT_ID'),
    'PORT': os.getenv('PORT')
}
for key, value in railway_vars.items():
    logger.info(f"🔍 DEBUG: {key}: {value}")

# Check build-time environment
logger.info("🔍 DEBUG: === BUILD ENVIRONMENT ANALYSIS ===")
build_vars = {
    'PWD': os.getenv('PWD'),
    'HOME': os.getenv('HOME'),
    'PATH': os.getenv('PATH')[:200] + '...' if os.getenv('PATH') else None,  # Truncate PATH
    'NODE_ENV': os.getenv('NODE_ENV'),
    'NIXPACKS_METADATA': os.getenv('NIXPACKS_METADATA'),
    'NIXPACKS_PLAN': os.getenv('NIXPACKS_PLAN')
}
for key, value in build_vars.items():
    logger.info(f"🔍 DEBUG: {key}: {value}")

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
        logger.info("🔍 DEBUG: Received prediction request")
        logger.info(f"🔍 DEBUG: Request data: {request.data}")
        logger.info(f"🔍 DEBUG: Request type: {type(request)}")
        
        # Placeholder prediction logic
        # In a real app, you'd load your model and make predictions
        prediction_result = {
            "prediction": "sample_prediction",
            "confidence": 0.95,
            "model_version": "v1.0.0"
        }
        
        logger.info(f"🔍 DEBUG: Prediction result: {prediction_result}")
        
        response = PredictionResponse(**prediction_result)
        logger.info(f"🔍 DEBUG: Response object: {response}")
        logger.info(f"🔍 DEBUG: Response dict: {response.dict()}")
        
        return response
    
    except Exception as e:
        logger.error(f"🔍 DEBUG: Exception in predict endpoint: {str(e)}")
        logger.error(f"🔍 DEBUG: Exception type: {type(e)}")
        logger.error(f"🔍 DEBUG: Exception args: {e.args}")
        import traceback
        logger.error(f"🔍 DEBUG: Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Static files serving for React app
# Check if frontend build exists
# frontend_build_path = Path("frontend/dist")
# In Railway, the code lives under /app/app, so we use this ENV or fallback.
# FRONTEND_ROOT = os.getenv("FRONTEND_ROOT", "app/frontend")
# frontend_build_path = Path(FRONTEND_ROOT) / "dist"
frontend_build_path = Path("frontend/dist")

# Add comprehensive debugging
logger.info("🔍 DEBUG: === FRONTEND BUILD DIRECTORY ANALYSIS ===")
logger.info(f"🔍 DEBUG: Current working directory: {os.getcwd()}")
logger.info(f"🔍 DEBUG: Checking for frontend build at: {frontend_build_path.absolute()}")
logger.info(f"🔍 DEBUG: Frontend build path exists: {frontend_build_path.exists()}")

# Check parent directory structure
frontend_parent = Path("frontend")
logger.info(f"🔍 DEBUG: Frontend parent directory exists: {frontend_parent.exists()}")
if frontend_parent.exists():
    try:
        frontend_contents = list(frontend_parent.iterdir())
        logger.info(f"🔍 DEBUG: Frontend directory contents: {[str(p) for p in frontend_contents]}")
    except Exception as e:
        logger.error(f"🔍 DEBUG: Error listing frontend directory: {e}")

# Check root directory structure
root_path = Path(".")
try:
    root_contents = [p for p in root_path.iterdir() if p.is_dir()]
    logger.info(f"🔍 DEBUG: Root directory folders: {[str(p) for p in root_contents]}")
except Exception as e:
    logger.error(f"🔍 DEBUG: Error listing root directory: {e}")

# Check if dist exists but in wrong location
possible_dist_paths = [
    Path("dist"),
    Path("./dist"),
    Path("../frontend/dist"),
    Path("frontend/build"),
    Path("build")
]
logger.info("🔍 DEBUG: Checking alternative dist locations:")
for path in possible_dist_paths:
    logger.info(f"🔍 DEBUG: {path.absolute()}: {path.exists()}")

if frontend_build_path.exists():
    logger.info("🔍 DEBUG: === FRONTEND BUILD FOUND - SETTING UP STATIC FILES ===")
    
    # Additional debug for static files
    dist_contents = list(frontend_build_path.iterdir())
    logger.info(f"🔍 DEBUG: Dist directory contents: {[str(p) for p in dist_contents]}")
    
    # Check for index.html specifically
    index_file = frontend_build_path / "index.html"
    logger.info(f"🔍 DEBUG: Index.html exists: {index_file.exists()}")
    
    # Check for assets directory
    assets_dir = frontend_build_path / "assets"
    logger.info(f"🔍 DEBUG: Assets directory exists: {assets_dir.exists()}")
    if assets_dir.exists():
        assets_contents = list(assets_dir.iterdir())
        logger.info(f"🔍 DEBUG: Assets directory contents: {[str(p) for p in assets_contents]}")
    
    # Mount static files
    app.mount("/static", StaticFiles(directory="frontend/dist/assets"), name="static")
    logger.info("🔍 DEBUG: Static files mounted at /static")
    
    # Serve React app for all other routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """
        Serve React app for all non-API routes
        This enables client-side routing
        """
        logger.info(f"🔍 DEBUG: Serving React app for path: {full_path}")
        
        # Don't serve React app for API routes
        if full_path.startswith("api/"):
            logger.info(f"🔍 DEBUG: Rejecting API path: {full_path}")
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Serve index.html for all other routes
        index_file = frontend_build_path / "index.html"
        if index_file.exists():
            logger.info(f"🔍 DEBUG: Serving index.html for path: {full_path}")
            return FileResponse(index_file)
        else:
            logger.error(f"🔍 DEBUG: Index.html not found at: {index_file}")
            raise HTTPException(status_code=404, detail="Frontend not found")
else:
    logger.warning("🔍 DEBUG: === FRONTEND BUILD NOT FOUND - USING JSON FALLBACK ===")
    logger.warning("Frontend build directory not found. React app will not be served.")
    
    @app.get("/")
    async def root():
        """Root endpoint when frontend is not built"""
        logger.info("🔍 DEBUG: Serving JSON root endpoint")
        return {
            "message": "FastAPI backend is running",
            "docs": "/api/docs",
            "frontend_status": "not_built"
        }

# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={"error": "Not found", "path": str(request.url)}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    """Custom 500 handler"""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"  # Railway requires binding to 0.0.0.0
    uvicorn.run(app, host=host, port=port) 