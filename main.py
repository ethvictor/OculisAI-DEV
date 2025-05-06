
from fastapi import FastAPI, HTTPException, Request
from dotenv import load_dotenv
import os
import openai
import logging
from fastapi.middleware.cors import CORSMiddleware
import re
from fastapi.responses import JSONResponse
from database import init_db

# Import our modules
from utils.logging_utils import configure_logging
from routes import analysis_routes, user_routes, report_routes

# Load environment variables
load_dotenv()

# Get API key or raise an error
openai.api_key = os.getenv("VITE_OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OpenAI API-nyckel saknas i miljövariabler.")

# Configure logging
logger = configure_logging()

# Create FastAPI application
app = FastAPI()

# Set up startup event handlers
app.add_event_handler("startup", init_db)

# Error middleware to capture and log detailed error information
@app.middleware("http")
async def error_logging_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Uncaught exception: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": f"Server error: {str(e)}"},
        )

# Updated CORS middleware to allow more origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8080", 
        "http://localhost:8080", 
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://192.168.0.243:8080",  # Added VM IP address for frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes from the modularized files
app.include_router(analysis_routes.router)
app.include_router(user_routes.router)
app.include_router(report_routes.router)
