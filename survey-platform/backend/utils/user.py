from fastapi import UploadFile
from sqlalchemy import select, inspect, or_

from werkzeug.security import check_password_hash, generate_password_hash

from json import loads
import aiofiles
from uuid import uuid4

from dotenv import load_dotenv
from os import getenv

from asyncio import gather

from database.database import sessionDep
from database.models import User, Confirmation

from other.get_last_response import get_last_response
from other.activity_log_translator import translations

from utils.cache import cache

load_dotenv()
ABS_PATH = getenv('ABS_PATH')

class UserControl:

    async def get_user_session(self, user_id: str, session: sessionDep) -> User | None:
        stmt_user = select(User).where(User.uuid == user_id)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()
        
        return user

    async def get_user(self, user_id: str, session: sessionDep) -> dict[str, str | int] | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        return {c.key: getattr(user, c.key) for c in inspect(user).mapper.column_attrs}
    
    async def get_user_by_email_or_username(self, email_or_username: str, session: sessionDep) -> dict[str, str | int] | bool:
        stmt_user = select(User).where(or_(User.username == email_or_username, User.email == email_or_username), User.provider == 'email')
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()
        
        if not user:
            return False
        
        return {c.key: getattr(user, c.key) for c in inspect(user).mapper.column_attrs}
    
    async def get_user_responses(self, user_id: str, session: sessionDep) -> list[str] | bool:
        user = await self.get_user(user_id, session)

        if not user:
            return False
        
        responses_list = loads(user.get('responses'))

        return responses_list
    
    async def change_avatar(self, user_id: str, image: UploadFile, session: sessionDep) -> str | bool:
        if not image or image.size >= 5_000_000:
            return False

        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        filename = image.filename if image.filename != 'blob' else str(uuid4()) +  '.' + image.headers.get('content-type').split('/')[1]
        
        async with aiofiles.open(f'{ABS_PATH}/images/{filename}', 'wb') as file:
            content = await image.read()
            await file.write(content)
        
        file_link = f'http://localhost:8000/images/{filename}'

        user.avatar = file_link
        await session.commit()

        await cache.delete(f'user-profile:{user_id}')

        return file_link
    
    async def verify_password(self, user_id: str, password: str, session: sessionDep) -> bool:
        user_data = await self.get_user(user_id, session)

        if not user_data or not check_password_hash(user_data.get('password'), password):
            return False
        
        return True
    
    async def change_user_data(self, user_id: str, displayName: str, username: str, session: sessionDep) -> tuple[str, str] | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        user.username = username
        user.displayName = displayName
        await session.commit()

        await cache.delete(f'user-profile:{user_id}')

        return username, displayName
    
    async def change_email(self, user_id: str, email: str, session: sessionDep) -> str | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        user.email = email
        await session.commit()

        await cache.delete(f'user-profile:{user_id}')

        return email
    
    async def update_password(self, user_id: str, current_password: str, new_password: str, session: sessionDep) -> bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        if not check_password_hash(user.password, current_password):
            return False
        
        user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
        await session.commit()

        return True
    
    async def set_email_verification(self, user_id: str, session: sessionDep) -> bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        user.twoStepVerification = True
        user.verificationType = 'email'

        await session.commit()

        return True
    
    async def delete_account(self, user_id: str, session: sessionDep) -> bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        await session.delete(user)
        await session.commit()

        return True
    
    async def create_change_password_confirmation(self, user_id: str, expires_at: int, session: sessionDep) -> str:
        UUID = str(uuid4())

        new_confirmation = Confirmation(type='change_password', user_id=user_id, status='pending', expires_at=expires_at, token=UUID)
        
        session.add(new_confirmation)
        await session.commit()

        return UUID
    
    async def change_password_remotely(self, user_id: str, new_password: str, session: sessionDep) -> bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
        await session.commit()

        return True
    
    async def get_avatar(self, user_id: str, session: sessionDep) -> str | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        return user.avatar
    
    async def reset_two_factor_verification(self, user_id: str, session: sessionDep) -> bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        user.twoStepVerification = False
        user.verificationType = None

        await session.commit()

        return True
    
    async def update_personal_info(self, user_id: str, data_to_update: dict[str, str], session: sessionDep) -> dict | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False

        for key, value in data_to_update.items():
            if not hasattr(user, key):
                continue

            setattr(user, key, value)

        await session.commit()
        await session.refresh(user)

        await cache.delete(f'user-profile:{user_id}')

        return {'bio': user.bio, 'location': user.location, 'website': user.website, 'company': user.company}
    
    async def get_user_activity_log(self, user_id: str, session: sessionDep) -> list[dict] | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        updated_logs = []

        for log in sorted(loads(user.activityLog), key=lambda activity: activity['time'], reverse=True):
            last_response = await get_last_response(log.get('time'), user.language)

            log['time'] = last_response

            if user.language == 'ru':
                if not log.get('login_item'):
                    log['action'] = translations[log['action']]
                else:
                    log['action'], log['item'] = translations[log['action']], translations[log['item']]

            updated_logs.append(log)
        
        return updated_logs
    
    async def get_user_settings_data(self, user_id: str, session: sessionDep) -> dict | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        return {'trackActivity': user.trackActivity}
    
    async def switch_track_activity(self, user_id: str, track_activity: bool, session: sessionDep) -> bool | str:
        user = await self.get_user_session(user_id, session)
        
        if not user:
            return '404'
        
        user.trackActivity = track_activity

        await session.commit()

        await cache.delete(f'user-profile-settings:{user_id}')

        return track_activity
    
    async def upgrade_user_plan(self, user_id: str, plan: str, session: sessionDep) -> bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False

        user.plan = plan

        await session.commit()

        await cache.delete(f'user-dropdown:{user_id}')

        return True
    
    async def get_user_plan(self, user_id: str, session: sessionDep) -> str | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        return user.plan
    
    async def upload_banner(self, user_id: str, banner: UploadFile, session: sessionDep) -> str | bool:
        if not banner or banner.size >= 5_000_000:
            return False
        
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        filename = banner.filename if banner.filename != 'blob' else str(uuid4()) +  '.' + banner.headers.get('content-type').split('/')[1]
        
        async with aiofiles.open(f'{ABS_PATH}/images/{filename}', 'wb') as file:
            content = await banner.read()
            await file.write(content)
        
        file_link = f'http://localhost:8000/images/{filename}'

        user.banner = file_link
        await session.commit()

        await cache.delete(f'user-profile:{user_id}')

        return file_link
    
    async def update_user_language(self, user_id: str, language_code: str, session: sessionDep) -> bool:
        user = await self.get_user_session(user_id, session)

        if not user or language_code not in ['en', 'ru']:
            return False
        
        user.language = language_code

        await session.commit()

        keys_to_delete = [f'user-profile:{user_id}', f'user-achievements:{user_id}', f'user-activity:{user_id}']

        await gather(*[cache.delete(key) for key in keys_to_delete])

        return True
    
    async def get_user_language(self, user_id: str, session: sessionDep) -> str | bool:
        user = await self.get_user_session(user_id, session)

        if not user:
            return False
        
        return user.language