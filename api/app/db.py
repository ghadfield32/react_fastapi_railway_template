# api/app/db.py
from contextlib import asynccontextmanager
import os, logging
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from .models import Base

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Database engine & session factory (module-level singletons – cheap & safe)
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db")
engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# ---------------------------------------------------------------------------
# FastAPI lifespan – runs ONCE at startup / shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app):
    """Open & dispose engine at app startup/shutdown; create all tables."""
    logger.info("🗄️  Initializing database…  URL=%s", DATABASE_URL)
    try:
        async with engine.begin() as conn:
            # DDL is safe here; it blocks startup until complete
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified successfully")
        yield
    finally:
        logger.info("🔒 Disposing database engine…")
        await engine.dispose()

# ---------------------------------------------------------------------------
# Dependency injection helper
# ---------------------------------------------------------------------------
async def get_db() -> AsyncSession:
    """Yield a new DB session per request."""
    async with AsyncSessionLocal() as session:
        yield session
