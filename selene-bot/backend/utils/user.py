from sqlalchemy import select, and_

from typing import Any

from json import dumps, loads

from asyncio import gather

import secrets

from datetime import datetime, timezone

from database.database import SessionDep
from database.models import User, Session

from utils.cache import cache

class UserControl:

    @staticmethod
    async def get_user_object_by_email(email: str, session: SessionDep) -> User:
        stmt_user = select(User).where(User.email == email)
        res = await session.execute(stmt_user)
        user = res.scalar()

        return user
    
    @staticmethod
    async def get_user_data_by_email(email: str, session: SessionDep) -> dict[str, Any]:
        user = await UserControl.get_user_object_by_email(email, session)

        return {'name': user.username, 'avatar': user.avatarId, 'email': user.email, 'plan': loads(user.plan), 'language': user.language}
    
    @staticmethod
    async def upgrade_plan(email: str, plan: str, session: SessionDep) -> None:
        user = await UserControl.get_user_object_by_email(email, session)

        user.plan = dumps([plan, 700 if plan == 'free' else (1400 if plan == 'pro' else 2100)])

        await session.commit()

    @staticmethod
    async def get_user_settings_data(email: str, session: SessionDep) -> dict[str, Any]:
        user = await UserControl.get_user_object_by_email(email, session)

        return {'avatarId': user.avatarId, 'fullName': user.username, 'displayName': user.callName, 'workFunction': user.workFunction, 'preferences': user.preferences, 'colorMode': user.appearance, 'billingPlan': loads(user.plan)[0]}
    
    @staticmethod
    async def update_user_data(items_to_update: dict[str, Any], email: str, session: SessionDep) -> None:
        user = await UserControl.get_user_object_by_email(email, session)

        for key, value in items_to_update.items():
            if not hasattr(user, key):
                continue

            setattr(user, key, value)

        await session.commit()

        await gather(*[cache.delete(key) for key in [f'user-data:{email}', f'settings-data:{email}']])

    @staticmethod
    async def update_theme(theme: str, email: str, session: SessionDep) -> None:
        user = await UserControl.get_user_object_by_email(email, session)

        user.appearance = theme

        await session.commit()

        await cache.delete(f'settings-data:{email}')

    @staticmethod
    async def update_language(language: str, email: str, session: SessionDep) -> None:
        user = await UserControl.get_user_object_by_email(email, session)

        user.language = language

        await session.commit()

    @staticmethod
    async def delete_account(email: str, session: SessionDep) -> None:
        user = await UserControl.get_user_object_by_email(email, session)

        await session.delete(user)
        await session.commit()

    @staticmethod
    async def create_session(email: str, session: SessionDep) -> tuple[str, str]:
        SESSION_ID, CSRF_TOKEN = secrets.token_urlsafe(32), secrets.token_urlsafe(32)

        user = await UserControl.get_user_object_by_email(email, session)

        new_session = Session(user_id=user.id, session_id=SESSION_ID, csrf_token=CSRF_TOKEN, csrf_updated_at=datetime.now(timezone.utc).timestamp())

        session.add(new_session)
        await session.commit()

        return SESSION_ID, CSRF_TOKEN
    
    @staticmethod
    async def delete_session(email: str, session_id: str, session: SessionDep) -> None:
        user = await UserControl.get_user_object_by_email(email, session)

        stmt_user_session = await session.execute(select(Session).where(and_(Session.user_id == user.id, Session.session_id == session_id)))

        user_session = stmt_user_session.scalar()

        await session.delete(user_session)
        await session.commit()

    @staticmethod
    async def get_session(email: str, session_id: str, session: SessionDep) -> Session:
        user = await UserControl.get_user_object_by_email(email, session)

        stmt_user_session = await session.execute(select(Session).where(and_(Session.user_id == user.id, Session.session_id == session_id)))

        user_session = stmt_user_session.scalar()

        return user_session
    
    @staticmethod
    async def update_csrf_token(new_csrf_token: str, email: str, session_id: str, session: SessionDep) -> None:
        user = await UserControl.get_user_object_by_email(email, session)

        stmt_user_session = await session.execute(select(Session).where(and_(Session.user_id == user.id, Session.session_id == session_id)))

        user_session = stmt_user_session.scalar()

        user_session.csrf_token, user_session.csrf_updated_at = new_csrf_token, datetime.now(timezone.utc).timestamp()

        await session.commit()