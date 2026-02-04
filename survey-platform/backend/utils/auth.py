from sqlalchemy import select, or_, and_

from jose import jwt, JWTError
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone, timedelta
import aiohttp
from json import dumps
from datetime import datetime, timezone

from dotenv import load_dotenv
from os import getenv
from uuid import uuid4

from database.database import sessionDep
from database.models import User

from other.random_hex_color import generate_random_hex_color

load_dotenv()

JWK_KEY = getenv('JWK_KEY')

class Auth:

    async def register(self, *, avatar: str = None, username: str, email: str, password: str, provider: str, session: sessionDep) -> tuple[str, int, str] | bool:
        stmt_user = select(User).where(or_(User.username == username, User.email == email), User.provider == provider)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        if user:
            return False
        
        token_exp = int((datetime.now(timezone.utc) + timedelta(hours=3)).timestamp())
        
        data = {'data': username, 'exp': token_exp}

        access_token = jwt.encode(data, JWK_KEY)

        UUID = str(uuid4())

        user_color = await generate_random_hex_color()

        new_user = User(avatar=f'https://ui-avatars.com/api/?name={username}&background={user_color}&color=fff&size=128' if not avatar else avatar, username=username, email=email, password=generate_password_hash(password, method='pbkdf2:sha256'), uuid=UUID, provider=provider, responses=dumps([]), achievements=dumps([{'id': 'first_login', 'date': int(datetime.now(timezone.utc).timestamp())}]), activityLog=dumps([{'action': 'Created', 'item': 'Account.', 'time': int(datetime.now(timezone.utc).timestamp()), 'login_item': True}]), trackActivity=True, plan='free', displayName=username)

        session.add(new_user)
        await session.commit()

        return access_token, token_exp, UUID
    
    async def login(self, username_or_email: str, password: str, provider: str, twoFactor: bool, session: sessionDep) -> tuple[str, int, str, str] | bool | str:
        stmt_user = select(User).where(or_(User.username == username_or_email, User.email == username_or_email), User.provider == provider)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        if not user:
            print('Not exists')
            return False
        elif user.provider == 'google' or user.provider == 'github':
            pass
        elif not user or not check_password_hash(user.password, password):
            return False
        elif not twoFactor and user.twoStepVerification and user.verificationType == 'email':
            return 'Email two factor required.'
        
        token_exp = int((datetime.now(timezone.utc) + timedelta(hours=3)).timestamp())
        
        data = {'data': username_or_email, 'exp': token_exp}

        access_token = jwt.encode(data, JWK_KEY)

        return access_token, token_exp, user.uuid, user.language
    
    async def verify_token(self, token: str) -> bool:
        try:
            payload = jwt.decode(token, JWK_KEY, algorithms=['HS256'])
            return True
        except JWTError:
            return False
        
    async def authorize_via_github(self, token: dict[str, str], session: sessionDep) -> tuple[str, int, str] | bool:
        async with aiohttp.ClientSession() as client_session:
            async with client_session.get('https://api.github.com/user', headers={'Authorization': f'Bearer {token['access_token']}', 'Accept': 'application/vnd.github+json'}) as response:
                data = await response.json()
            async with client_session.get('https://api.github.com/user/emails', headers={'Authorization': f'Bearer {token['access_token']}', 'Accept': 'application/vnd.github+json'}) as response:
                emails = await response.json()

        first_email = emails[0]['email']

        stmt_user = select(User).where(and_(User.email == first_email, User.provider == 'github'))
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        if user:
            token_exp = int((datetime.now(timezone.utc) + timedelta(hours=3)).timestamp())
        
            token_data = {'data': first_email, 'exp': token_exp}

            access_token = jwt.encode(token_data, JWK_KEY)

            return access_token, token_exp, user.uuid
        
        UUID = str(uuid4())
        
        new_user = User(avatar=data['avatar_url'], username=data['name'], email=first_email, uuid=UUID, provider='github', password=generate_password_hash('', method='pbkdf2:sha256'), responses=dumps([]))

        session.add(new_user)
        await session.commit()

        token_exp = int((datetime.now(timezone.utc) + timedelta(hours=3)).timestamp())
        
        token_data = {'data': first_email, 'exp': token_exp}

        access_token = jwt.encode(token_data, JWK_KEY)

        return access_token, token_exp, UUID