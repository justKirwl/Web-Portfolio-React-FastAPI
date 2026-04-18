from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from fastapi import Depends

from dotenv import load_dotenv
from os import getenv

from typing import Annotated

from database.models import Base

load_dotenv()

DB_USER = getenv('DB_USER')
DB_PASSWORD = getenv('DB_PASSWORD')

DB_HOST = getenv('DB_HOST')
DB_PORT = getenv('DB_PORT')

DB_NAME = getenv('DB_NAME')

DB_URL = getenv('DATABASE_URL')

engine = create_async_engine(f'postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}' if not DB_URL else DB_URL.split('?sslmode=require&channel_binding=require')[0])

new_session = async_sessionmaker(engine, expire_on_commit=False)

async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_session():
    async with new_session() as session:
        yield session

SessionDep = Annotated[AsyncSession, Depends(get_session)]