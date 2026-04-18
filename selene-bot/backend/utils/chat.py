from sqlalchemy import select, desc, and_

from uuid import uuid4
from typing import Any
from datetime import datetime, timezone

from utils.cache import cache

from database.database import SessionDep
from database.models import Chat, User, Message

from other.humanize_time import get_humanized_time

class ChatControl:

    @staticmethod
    async def check_chat_owner(chat_id: str, email: str, session: SessionDep) -> tuple[Chat, User] | bool:
        res = await session.execute(select(User).where(User.email == email))
        owner = res.scalar()

        res = await session.execute(select(Chat).where(Chat.chat_id == chat_id))
        chat = res.scalar_one_or_none()

        if not chat or chat.owner_id != owner.id:
            return False
        
        return chat, owner
    
    @staticmethod
    async def new_chat(items: dict[str, Any], owner_email: str,  session: SessionDep) -> str:
        res = await session.execute(select(User).where(User.email == owner_email))
        owner = res.scalar()

        CHAT_ID = str(uuid4())

        chat = Chat(title='Untitled', owner_id=owner.id, chat_id=CHAT_ID)

        message = Message(chat_id=CHAT_ID, sender_id=owner.id, is_user=True, content=items['title'], created_at=items['time'], message_id=str(uuid4()))

        session.add_all([chat, message])
        await session.commit()

        await cache.delete(f'user-chats:{owner_email}')

        return CHAT_ID
    
    @staticmethod
    async def create_user_message(items: dict[str, Any], owner_email: str, session: SessionDep) -> Message | bool:
        OWNER_CHECK = await ChatControl.check_chat_owner(items['chatId'], owner_email, session)

        if not (OWNER_CHECK := await ChatControl.check_chat_owner(items['chatId'], owner_email, session)):
            return False
        
        chat, owner = OWNER_CHECK
        
        await ChatControl.set_is_new_chat(items['chatId'], False, session)

        message = Message(chat_id=items['chatId'], sender_id=owner.id, is_user=True, content=items['prompt'], created_at=items['time'], message_id=str(uuid4()))

        chat.lastUpdated = int(datetime.now(timezone.utc).timestamp())

        session.add(message)
        await session.commit()
        await session.refresh(message)

        await cache.delete(f'user-chats:{owner_email}')

        return message
    
    @staticmethod
    async def get_user_chats(email: str, session: SessionDep) -> list[dict[str, Any]]:
        res = await session.execute(select(User).where(User.email == email))
        owner = res.scalar()

        res = await session.execute(select(Chat).where(Chat.owner_id == owner.id))
        chats = res.scalars().all()

        if not chats:
            return []
        
        chats_list = []

        for chat in chats:
            stmt_message = select(Message).where(Message.chat_id == chat.chat_id).order_by(desc(Message.id)).limit(1)
            res = await session.execute(stmt_message)
            last_message = res.scalar_one_or_none()

            chats_list.append({'title': chat.title, 'favorite': chat.favorite, 'ownerId': chat.owner_id, 'chatId': chat.chat_id, 'newChat': chat.new_chat, 'updatedAt': chat.lastUpdated, 'updatedAtHumanized': get_humanized_time(chat.lastUpdated), 'lastMessage': last_message.content if last_message else ''})
        
        return chats_list
    
    @staticmethod
    async def get_chat_messages(email: str, chat_id: str, session: SessionDep) -> list | bool:
        chat, _ = await ChatControl.check_chat_owner(chat_id, email, session)

        res = await session.execute(select(Message).where(Message.chat_id == chat.chat_id).order_by(Message.created_at.asc()))
        messages = res.scalars().all()

        if not messages:
            return []
        
        return [{'messageId': message.message_id, 'isUser': message.is_user, 'content': message.content, 'ts': message.created_at, 'thinkingTime': message.thinkingTime} for message in messages]
    
    @staticmethod
    async def save_bot_message(message_items: dict[str, Any], email: str, chat_id: str, session: SessionDep) -> bool:
        if not (OWNER_CHECK := await ChatControl.check_chat_owner(chat_id, email, session)):
            return False
        
        chat, _ = OWNER_CHECK
        
        new_message = Message(content=message_items['content'], created_at=message_items['time'], thinkingTime=message_items['thinkingTime'], chat_id=chat_id, message_id=str(uuid4()))

        chat.lastUpdated = int(datetime.now(timezone.utc).timestamp())

        session.add(new_message)
        await session.commit()

        await cache.delete(f'user-chats:{email}')

        return True
    
    @staticmethod
    async def check_new_chat(chat_id: str, email: str, session: SessionDep) -> bool:
        if not (OWNER_CHECK := await ChatControl.check_chat_owner(chat_id, email, session)):
            return False
        
        chat, _ = OWNER_CHECK
        
        return chat.new_chat
    
    @staticmethod
    async def set_is_new_chat(chat_id: str, is_new: bool, session: SessionDep) -> None:
        res = await session.execute(select(Chat).where(Chat.chat_id == chat_id))
        chat = res.scalar_one_or_none()

        chat.new_chat = is_new

        await session.commit()

    @staticmethod
    async def delete_chat(chat_id: str, owner_email: str, session: SessionDep) -> bool:
        OWNER_CHECK = await ChatControl.check_chat_owner(chat_id, owner_email, session)

        if not (OWNER_CHECK := await ChatControl.check_chat_owner(chat_id, owner_email, session)):
            return False
        
        chat, _ = OWNER_CHECK
        
        await session.delete(chat)
        await session.commit()

        await cache.delete(f'user-chats:{owner_email}')

        return True
    
    @staticmethod
    async def set_favorite_flag(chat_id: str, owner_email: str, session: SessionDep) -> bool:
        OWNER_CHECK = await ChatControl.check_chat_owner(chat_id, owner_email, session)

        if not (OWNER_CHECK := await ChatControl.check_chat_owner(chat_id, owner_email, session)):
            return False
        
        chat, _ = OWNER_CHECK
        
        chat.favorite = not chat.favorite

        await session.commit()

        await cache.delete(f'user-chats:{owner_email}')

        return True
    
    @staticmethod
    async def update_chat_title(chat_id: str, owner_email: str, new_title: str, session: SessionDep) -> bool:
        OWNER_CHECK = await ChatControl.check_chat_owner(chat_id, owner_email, session)

        if not (OWNER_CHECK := await ChatControl.check_chat_owner(chat_id, owner_email, session)):
            return False
        
        chat, _ = OWNER_CHECK
        
        chat.title = new_title
        chat.lastUpdated = int(datetime.now(timezone.utc).timestamp())

        await session.commit()

        await cache.delete(f'user-chats:{owner_email}')

        return True
    
    @staticmethod
    async def get_chat(chat_id: str, owner_email: str, session: SessionDep) -> dict[str, Any]:
        if not (OWNER_CHECK := await ChatControl.check_chat_owner(chat_id, owner_email, session)):
            return False
        
        chat, _ = OWNER_CHECK
        
        return {'chatId': chat.chat_id, 'title': chat.title, 'favorite': chat.favorite}
    
    @staticmethod
    async def get_bot_memory_messages(email: str, chat_id: str, session: SessionDep, limit: int | None = 5) -> list | bool:
        if not (OWNER_CHECK := await ChatControl.check_chat_owner(chat_id, email, session)):
            return False
        
        chat, _ = OWNER_CHECK
        
        if limit:
            res = await session.execute(select(Message).where(Message.chat_id == chat.chat_id).limit(limit))
        else:
            res = await session.execute(select(Message).where(Message.chat_id == chat.chat_id))
            
        messages = res.scalars().all()

        if not messages:
            return []
        
        return [{'isUser': message.is_user, 'content': message.content} for message in messages]
    
    @staticmethod
    async def delete_message(email: str, message_id: str, chat_id: str, session: SessionDep) -> bool:
        if not await ChatControl.check_chat_owner(chat_id, email, session):
            return False
        
        res = await session.execute(select(Message).where(Message.message_id == message_id))
        message = res.scalar_one_or_none()

        if not message:
            return False

        await session.delete(message)
        await session.commit()

        return True
    
    @staticmethod
    async def get_first_messages_by_timestamp(timestamp: int, email: str, chat_id: str, session: SessionDep) -> list[dict[str, Any]] | bool:
        if not await ChatControl.check_chat_owner(chat_id, email, session):
            return False
        
        res = await session.execute(select(Message).where(Message.chat_id == chat_id).filter(Message.created_at < timestamp).limit(5))
        messages = res.scalars().all()

        return [{'isUser': message.is_user, 'content': message.content} for message in messages] if messages else []
    
    @staticmethod
    async def resave_bot_message_content(content: str, chat_id: str, thinking_time: int, email: str, message_id: str, session: SessionDep) -> bool:
        if not await ChatControl.check_chat_owner(chat_id, email, session):
            return False
        
        res = await session.execute(select(Message).where(and_(Message.message_id == message_id, Message.chat_id == chat_id)))
        message = res.scalar_one_or_none()

        if not message:
            return False
        
        message.content = content
        message.thinkingTime = thinking_time

        await session.commit()

        return True
    
    @staticmethod
    async def update_message(content: str, email: str, message_id: str, session: SessionDep) -> bool:
        res = await session.execute(select(Message).where(Message.message_id == message_id))
        message = res.scalar_one_or_none()

        if not message:
            return False

        if not await ChatControl.check_chat_owner(message.chat_id, email, session):
            return False
        
        message.content = content

        await session.commit()

        return True