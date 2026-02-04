from sqlalchemy import select, and_, func

import re

from database.database import sessionDep
from database.models import Notification

from utils.cache import cache
from utils.user import UserControl

from other.get_last_response import get_last_response
from other.notif_translator import translations

user = UserControl()

class Notify:

    async def add_notification(self, notify_data: dict, session: sessionDep) -> bool:
        new_notification = Notification(**notify_data)
        
        session.add(new_notification)
        await session.commit()

        return True
    
    async def check_user_notifications_length(self, user_id: str, session: sessionDep) -> int | bool:
        stmt_notifications = select(func.count()).select_from(Notification).where(and_(Notification.receiver_id == user_id, Notification.read == False))
        res = await session.execute(stmt_notifications)
        count = res.scalar_one()

        return count
    
    async def get_user_notifications(self, user_id: str, session: sessionDep) -> list[dict | None]:
        stmt_notifications = select(Notification).where(Notification.receiver_id == user_id)
        res = await session.execute(stmt_notifications)
        notifications = res.scalars().all()

        if not notifications:
            return []

        notifications_mutable = []

        for row in notifications:
            row_dict = row.__dict__
            row_dict.pop('_sa_instance_state', None)
            
            notifications_mutable.append(row_dict)

        notif_list = []

        user_language = await user.get_user_language(user_id, session)

        if user_language == 'ru':
            sorted_keys = sorted(translations.keys(), key=len, reverse=True)
            pattern = re.compile('|'.join(re.escape(k) for k in sorted_keys))

        for notif in notifications_mutable:
            time_val = await get_last_response(notif.get('time'), user_language or 'en')

            if user_language == 'ru':
                notif['title'] = translations.get(notif['title'], notif['title'])
                
                if notif.get('message'):
                    notif['message'] = pattern.sub(lambda m: translations[m.group(0)], notif['message'])

            notif_list.append({
                'id': notif.get('id'),
                'type': notif.get('type'),
                'title': notif.get('title'),
                'message': notif.get('message'),
                'time': time_val,
                'read': notif.get('read')
            })

        return notif_list
    
    async def mark_notification_as_read(self, user_id: str, notif_id: int, session: sessionDep) -> bool:
        stmt_notification = select(Notification).where(and_(Notification.receiver_id == user_id, Notification.id == notif_id))
        res = await session.execute(stmt_notification)
        notification = res.scalar_one_or_none()

        if not notification:
            return False
        
        notification.read = True

        await session.commit()

        await cache.delete(f'user-notif:{user_id}')

        return True
    
    async def mark_all_notifications_as_read(self, user_id: str, session: sessionDep) -> bool:
        stmt_notifications = select(Notification).where(and_(Notification.receiver_id == user_id, Notification.read == False))
        res = await session.execute(stmt_notifications)
        notifications = res.scalars().all()

        if not notifications:
            return False
        
        for notification in notifications:
            notification.read = True

        await session.commit()

        await cache.delete(f'user-notif:{user_id}')

        return True
    
    async def delete_notification(self, user_id: str, notif_id: int, session: sessionDep) -> bool:
        stmt_notification = select(Notification).where(and_(Notification.receiver_id == user_id, Notification.id == notif_id))
        res = await session.execute(stmt_notification)
        notification = res.scalar_one_or_none()

        if not notification:
            return False
        
        await session.delete(notification)
        await session.commit()

        await cache.delete(f'user-notif:{user_id}')

        return True