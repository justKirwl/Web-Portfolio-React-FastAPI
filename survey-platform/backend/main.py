from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from dotenv import load_dotenv
from os import getenv

from routes.auth import router as auth_router
from routes.sockets import router as websocket_router
from routes.survey import router as survey_router
from routes.main import router as main_router
from routes.quiz import router as quiz_router
from routes.oauth import router as oauth_router
from routes.user import router as user_router

load_dotenv()
ABS_PATH = getenv('ABS_PATH')

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_methods=['*'], allow_headers=['*'], allow_credentials=True, allow_origins=['http://localhost:5173'])
app.add_middleware(SessionMiddleware, secret_key="ZPEtsV9CoQJCfvAz57y4xChebypJMyoY")

app.mount(f'/images', StaticFiles(directory=f'{ABS_PATH}/images'), name='images')

app.include_router(auth_router)
app.include_router(websocket_router)
app.include_router(survey_router)
app.include_router(main_router)
app.include_router(quiz_router)
app.include_router(oauth_router)
app.include_router(user_router)