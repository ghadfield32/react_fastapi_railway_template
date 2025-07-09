# api/app/db.py
from contextlib import asynccontextmanager
import os
import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from .models import Base

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db")

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

@asynccontextmanager
async def lifespan(app):
    """Open & dispose engine on startup/shutdown."""
    logger.info("🗄️  Initializing database...")
    logger.info(f"🔗 Database URL: {DATABASE_URL}")

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

    yield

    logger.info("🔒 Disposing database engine...")
    await engine.dispose()

async def get_db() -> AsyncSession:
    """Yield a new DB session for each request."""
    async with AsyncSessionLocal() as session:
        yield session


