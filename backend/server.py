from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Import routes
from routes.events import router as events_router
from routes.organizers import router as organizers_router
from routes.auth import router as auth_router

# Import database initialization
from database import init_database

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_database()
    print("✅ Database initialized successfully")
    yield
    # Shutdown
    print("🔄 Server shutting down...")

# Create the main app with lifespan
app = FastAPI(
    title="NearMe Events API",
    description="A location-based event finder and planner API",
    version="1.0.0",
    lifespan=lifespan
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "NearMe Events API is running!",
        "version": "1.0.0",
        "status": "healthy"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "API is running smoothly"
    }

# Include routers
api_router.include_router(events_router)
api_router.include_router(organizers_router)
api_router.include_router(auth_router)

# Include the main API router in the app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Not Found",
        "message": "The requested resource was not found",
        "status_code": 404
    }

@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    return {
        "error": "Internal Server Error", 
        "message": "An internal server error occurred",
        "status_code": 500
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )