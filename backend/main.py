import os
import sys
import time
import asyncio
import logging

# On Windows with Python 3.8+, Playwright async subprocesses require ProactorEventLoop
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.models.database import db
from backend.api.routes import router as audit_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("accesscheck.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup validation and SQLite DB init
    logger.info("Initializing AccessCheck AI backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT} | Host: {settings.HOST} | Port: {settings.PORT}")
    try:
        await db.init_db()
        db_alive = await db.check_connection()
        if db_alive:
            logger.info("SQLite database initialized and operational.")
        else:
            logger.warning("Database initialized but connectivity check returned False.")
    except Exception as e:
        logger.error(f"Critical error initializing SQLite database: {e}", exc_info=True)
        raise e
    
    yield

    # Graceful shutdown
    logger.info("AccessCheck AI backend shutting down gracefully...")

app = FastAPI(
    title="AccessCheck AI API",
    description="Enterprise website accessibility auditing platform using Google Chrome, Axe-core, and Google Gemini.",
    version="2.0.0",
    lifespan=lifespan
)

# Request logging & timing middleware
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path

    try:
        response = await call_next(request)
        duration = round((time.time() - start_time) * 1000, 2)
        logger.info(f"{method} {path} - {response.status_code} ({duration}ms) [client: {client_ip}]")
        return response
    except Exception as exc:
        duration = round((time.time() - start_time) * 1000, 2)
        logger.error(f"{method} {path} - EXCEPTION: {exc} ({duration}ms) [client: {client_ip}]", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": True,
                "status_code": 500,
                "detail": f"Internal server error: {str(exc)}",
                "path": path
            }
        )

# Standardized JSON error response handlers
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "status_code": 422,
            "detail": "Input validation error",
            "errors": exc.errors(),
            "path": request.url.path
        }
    )

# Robust, production-configurable CORS policy
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
)

# Health Check Endpoint
@app.get("/health", tags=["System"])
async def health_check():
    db_ok = await db.check_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "AccessCheck AI API",
        "version": "2.0.0",
        "database_connected": db_ok,
        "environment": settings.ENVIRONMENT,
        "gemini_model": settings.GEMINI_MODEL,
        "ai_enabled": bool(settings.GEMINI_API_KEY)
    }

# Register Routers
app.include_router(audit_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
