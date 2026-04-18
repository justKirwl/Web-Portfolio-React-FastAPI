from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from starlette.middleware.sessions import SessionMiddleware

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from os import getenv

from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.oauth import router as oauth_router
from routes.bot import router as bot_router

from utils.cache import redis_limiter

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await redis_limiter.ping()
        print(f"[INFO] > Redis Limiter connected: {datetime.now(timezone.utc)}")
    except Exception as e:
        raise e
    
    yield
    
    await redis_limiter.aclose()
    print(f"[INFO] > Redis Limiter connection closed.")

load_dotenv()

FRONTEND_HOST = getenv('FRONTEND_HOST')

app = FastAPI(lifespan=lifespan)

app.add_middleware(SessionMiddleware, secret_key='726397e2-6730-4c59-a297-a455f0738b87')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173', FRONTEND_HOST], allow_headers=['*'], allow_methods=['*'], allow_credentials=True)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(oauth_router)
app.include_router(bot_router)