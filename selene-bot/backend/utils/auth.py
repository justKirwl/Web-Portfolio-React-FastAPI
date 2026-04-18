from sqlalchemy import select, exists

from typing import Any

import jwt
from datetime import datetime, timezone, timedelta

import aiohttp

from dotenv import load_dotenv
from os import getenv

from database.database import SessionDep
from database.models import User

from utils.user import UserControl

load_dotenv()

JWT_SECRET_KEY = getenv('JWT_SECRET_KEY')
JWT_ALGORITHM = getenv('JWT_ALGORITHM')

user = UserControl()

class Auth:

    @staticmethod
    async def check_user_for_exist(email: str, session: SessionDep) -> bool:
        stmt_user = select(exists().where(User.email == email))
        res = await session.execute(stmt_user)
        is_exists = res.scalar()

        if not is_exists:
            return False
        
        return True
    
    @staticmethod
    async def register_user(items_to_register: dict[str, Any], session: SessionDep):
        if await Auth.check_user_for_exist(items_to_register.get('email'), session):
            return False
        
        new_user = User(**items_to_register, callName=items_to_register.get('username'))

        session.add(new_user)
        await session.commit()

        return True
    
    @staticmethod
    async def give_credentials(email: str) -> tuple[str, str]:
        access_payload = {
            'email': email,
            'exp': datetime.now(timezone.utc) + timedelta(minutes=15),
            'type': 'access'
        }

        access_token = jwt.encode(access_payload, JWT_SECRET_KEY, JWT_ALGORITHM)

        refresh_payload = {
            'email': email,
            'exp': datetime.now(timezone.utc) + timedelta(days=7),
            'type': 'refresh'
        }

        refresh_token = jwt.encode(refresh_payload, JWT_SECRET_KEY, JWT_ALGORITHM)

        return access_token, refresh_token
    
    @staticmethod
    async def verify_access_token(access_token: str) -> dict[str, Any] | bool:
        try:
            payload = jwt.decode(access_token, JWT_SECRET_KEY, [JWT_ALGORITHM])
            return payload
        except (jwt.ExpiredSignatureError, jwt.DecodeError, jwt.InvalidTokenError):
            return False
    
    @staticmethod
    async def refresh_access_token(refresh_token: str) -> str | bool:
        try:
            decode_token = jwt.decode(refresh_token, JWT_SECRET_KEY, [JWT_ALGORITHM])
            
            if decode_token['type'] != 'refresh':
                return False
            
            new_access_payload = {
                'email': decode_token['email'],
                'exp': datetime.now(timezone.utc) + timedelta(minutes=15),
                'type': 'access'
            }
            
            new_access_token = jwt.encode(new_access_payload, JWT_SECRET_KEY, JWT_ALGORITHM)

            return new_access_token
        except jwt.ExpiredSignatureError:
            return False
        except jwt.InvalidTokenError:
            return False
        
    @staticmethod
    async def google_authorization(items_to_authorize: dict[str, Any], session: SessionDep) -> tuple[str, str]:
        await Auth.register_user(items_to_authorize, session)

        CREDENTIALS = await Auth.give_credentials(items_to_authorize['email'])

        return CREDENTIALS
    
    @staticmethod
    async def github_authorization(token: str, session: SessionDep) -> tuple[str, str, str, str]:
        async with aiohttp.ClientSession() as client_session:
            async with client_session.get('https://api.github.com/user', headers={'Authorization': f'Bearer {token['access_token']}', 'Accept': 'application/vnd.github+json'}) as response:
                data = await response.json()
            async with client_session.get('https://api.github.com/user/emails', headers={'Authorization': f'Bearer {token['access_token']}', 'Accept': 'application/vnd.github+json'}) as response:
                emails = await response.json()

        FIRST_EMAIL = emails[0]['email']

        DATA_TO_SIGNIN = {'username': data['name'], 'email': FIRST_EMAIL}

        await Auth.register_user(DATA_TO_SIGNIN, session)

        SESSION_ID, CSRF_TOKEN = await user.create_session(FIRST_EMAIL, session)

        CREDENTIALS = await Auth.give_credentials(FIRST_EMAIL)

        return (SESSION_ID, CSRF_TOKEN, *CREDENTIALS)