from fastapi import Depends

from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from dotenv import load_dotenv
from os import getenv
from typing import Annotated

from database.models import Base

load_dotenv()

DB_NAME = getenv('DB_NAME')
DB_PASSWORD = getenv('DB_PASSWORD')

engine = create_async_engine(f'postgresql+asyncpg://{DB_NAME}:{DB_PASSWORD}@localhost:5432/survey_db', pool_size=10, max_overflow=20)

session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_session():
    async with session() as new_session:
        yield new_session

@asynccontextmanager
async def get_session_manager():
    async with session() as new_session:
        try:
            yield new_session
        finally:
            await new_session.close()

async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

sessionDep = Annotated[AsyncSession, Depends(get_session)]