from importlib import util
if util.find_spec("passlib") is None:  # noqa: E402
    raise RuntimeError("Run `npm run install:all` before seeding; passlib is missing")

from passlib.context import CryptContext  # noqa: E402
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from api.app.models import Base, User

# Get credentials from environment with fallbacks
USERNAME = os.getenv("USERNAME_KEY", "alice")
PASSWORD = os.getenv("USER_PASSWORD", "secret")

engine = create_async_engine("sqlite+aiosqlite:///./app.db", future=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # Check if user exists
        result = await db.execute(select(User).filter_by(username=USERNAME))
        user = result.scalar_one_or_none()

        hashed_password = pwd.hash(PASSWORD)

        if user is None:
            # Create new user if doesn't exist
            u = User(username=USERNAME, hashed_password=hashed_password)
            db.add(u)
            action = "Created"
        else:
            # Update existing user's password
            user.hashed_password = hashed_password
            action = "Updated"

        await db.commit()
        print(f"{action} user '{USERNAME}' with password '{PASSWORD}'")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 

