from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.main import router as main_router

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:8000'], allow_methods=['*'], allow_headers=['*'], allow_credentials=True)

app.include_router(main_router)