from sqlalchemy import select

import pytest_asyncio
from aiohttp import ClientSession
from mimesis import Person
from werkzeug.security import generate_password_hash
from uuid import uuid4

from dotenv import load_dotenv
from os import getenv
from datetime import datetime, timedelta
from json import dumps

from jose import jwt

from database.database import get_session_manager
from database.models import User, Quiz, Survey

load_dotenv()

JWK_KEY = getenv('JWK_KEY')
person = Person('en')

@pytest_asyncio.fixture
async def client_session():
    async with ClientSession(base_url='http://localhost:8000') as conn:
        yield conn

@pytest_asyncio.fixture
async def test_token():
    exp = int((datetime.now() + timedelta(hours=3)).timestamp())
    payload = {"data": "testuser", 'exp': exp}
    return {'access_token': jwt.encode(payload, JWK_KEY, algorithm='HS256'), 'token_exp': exp}

@pytest_asyncio.fixture
async def test_user():
    async with get_session_manager() as session:
        new_user = User(avatar=f'https://ui-avatars.com/api/?name=test_login&background=#000&color=fff&size=128', username='test_login', email='test@email.com', password=generate_password_hash('0000', method='pbkdf2:sha256'), uuid='0000', provider='email', responses=dumps([]))

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        yield new_user

        stmt_user = select(User).where(User.email == 'test@email.com')
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()
        if user:
            await session.delete(user)
            await session.commit()

@pytest_asyncio.fixture
async def register_auto_cleanup():
    email = person.email(['gmail.com', 'email.com'])
    async with get_session_manager() as session:
        yield email
        stmt_user = select(User).where(User.email == email)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()
        if user:
            await session.delete(user)
            await session.commit()

@pytest_asyncio.fixture
async def quiz_create_auto_clear():
    async with get_session_manager() as session:
        title = str(uuid4())
        yield title

        stmt_quiz = select(Quiz).where(Quiz.title == title)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()
        if quiz:
            await session.delete(quiz)
            await session.commit()

@pytest_asyncio.fixture
async def create_survey_auto_cleanup():
    async with get_session_manager() as session:
        title = str(uuid4())
        yield title

        stmt_survey = select(Survey).where(Survey.title == title)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()
        if survey:
            await session.delete(survey)
            await session.commit()