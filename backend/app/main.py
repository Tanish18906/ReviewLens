from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import Base, engine
from app.routes import auth, products, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ReviewLens API",
    description="Semester 3 academic prototype for review collection, preprocessing, and descriptive analytics.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
def root_status():
    return {
        "project": "ReviewLens",
        "release": "Semester 3 prototype v1.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "academic_scope": "Semester 3 (No ML fake-detection claims)",
    }
