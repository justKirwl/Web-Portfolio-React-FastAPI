from sqlalchemy import ForeignKeyConstraint, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship

from datetime import datetime, timezone

from json import dumps

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    avatarId: Mapped[int] = mapped_column(default=1)
    callName: Mapped[str]
    username: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True, nullable=True)
    appearance: Mapped[str] = mapped_column(default='auto')
    plan: Mapped[str] = mapped_column(nullable=True, default=dumps(['free', 700]))
    preferences: Mapped[str] = mapped_column(nullable=True)
    workFunction: Mapped[str] = mapped_column(nullable=True)
    language: Mapped[str] = mapped_column(nullable=True)

class Message(Base):
    __tablename__ = 'messages'

    id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[str]
    sender_id: Mapped[int] = mapped_column(default=None, nullable=True)
    is_user: Mapped[bool] = mapped_column(default=False)
    content: Mapped[str]
    created_at: Mapped[int] = mapped_column(BigInteger)
    message_id: Mapped[str] = mapped_column(nullable=True)
    thinkingTime: Mapped[int] = mapped_column(nullable=True, default=None)

    chat: Mapped['Chat'] = relationship(back_populates='messages')

    __table_args__ = (ForeignKeyConstraint(['chat_id'], ['chats.chat_id'], name='fk_messages_chat_id_chats_chat_id', ondelete='CASCADE'), ForeignKeyConstraint(['sender_id'], ['users.id'], name='fk_messages_sender_id_users_id', ondelete='CASCADE'))

class Chat(Base):
    __tablename__ = 'chats'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    owner_id: Mapped[int]
    chat_id: Mapped[str] = mapped_column(unique=True)
    new_chat: Mapped[bool] = mapped_column(nullable=True, default=True)
    favorite: Mapped[bool] = mapped_column(nullable=True, default=False)
    lastUpdated: Mapped[int] = mapped_column(nullable=True, default=int(datetime.now(timezone.utc).timestamp()))

    messages: Mapped[list['Message']] = relationship(
        back_populates='chat',
        cascade='all, delete-orphan'
    )

    __table_args__ = (ForeignKeyConstraint(['owner_id'], ['users.id'], name='fk_chats_owner_id_users_id', ondelete='CASCADE'),)

class Session(Base):
    __tablename__ = 'sessions'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int]
    session_id: Mapped[str]
    csrf_token: Mapped[str]
    csrf_updated_at: Mapped[int] = mapped_column(nullable=True)

    __table_args__ = (ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_sessions_user_id_users_user_id', ondelete='CASCADE'),)