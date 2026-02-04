from sqlalchemy import ForeignKeyConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import BigInteger

from random import choice
from json import dumps

from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    banner: Mapped[str] = mapped_column(nullable=True, default=None)
    avatar: Mapped[str] = mapped_column(nullable=True, default=None)
    displayName: Mapped[str] = mapped_column(nullable=True)
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str]
    password: Mapped[str]
    emailVerified: Mapped[bool] = mapped_column(nullable=True, default=False)
    twoStepVerification: Mapped[bool] = mapped_column(nullable=True, default=False)
    verificationType: Mapped[str] = mapped_column(nullable=True, default=None)
    createdAt: Mapped[int] = mapped_column(nullable=True, default=int(datetime.now(timezone.utc).timestamp()))
    isOnline: Mapped[bool] = mapped_column(nullable=True, default=True)
    uuid: Mapped[str] = mapped_column(unique=True)
    provider: Mapped[str] = mapped_column(nullable=True)
    responses: Mapped[str] = mapped_column(nullable=True)
    bio: Mapped[str] = mapped_column(nullable=True, default=choice(['Hello, this is me!', "How ya'll doing?", "I didn't wrote my bio yet.", 'Lol, what is bio?']))
    location: Mapped[str] = mapped_column(nullable=True, default='Unknown')
    achievements: Mapped[str] = mapped_column(nullable=True)
    activityLog: Mapped[str] = mapped_column(nullable=True)
    trackActivity: Mapped[bool] = mapped_column(nullable=True)
    plan: Mapped[str] = mapped_column(nullable=True)
    profileBadge: Mapped[str] = mapped_column(nullable=True, default=choice(['top_creator', 'top_viewer', 'top_rater']))
    company: Mapped[str] = mapped_column(nullable=True, default='...')
    website: Mapped[str] = mapped_column(nullable=True, default='...')
    ratings: Mapped[str] = mapped_column(nullable=True, default=dumps([]))
    language: Mapped[str] = mapped_column(nullable=True, default='en')

class Survey(Base):
    __tablename__ = 'surveys'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[str]
    questions: Mapped[str]
    responses: Mapped[str]
    views: Mapped[str]
    status: Mapped[str]
    lastResponse: Mapped[int]
    authorId: Mapped[str]
    createdAt: Mapped[int] = mapped_column(nullable=True, default=int(datetime.now(timezone.utc).timestamp()))
    survey_id: Mapped[str] = mapped_column(nullable=True)
    copies: Mapped[int] = mapped_column(default=0, nullable=True)
    ratings: Mapped[str] = mapped_column(nullable=True)
    language: Mapped[str] = mapped_column(nullable=True)
    difficulty: Mapped[str] = mapped_column(nullable=True)
    tags: Mapped[str] = mapped_column(nullable=True)
    lastUpdated: Mapped[int] = mapped_column(nullable=True)

    __table_args__ = (ForeignKeyConstraint(['authorId'], ['users.uuid'], name='fk_surveys_users_uuid'),)

class Quiz(Base):
    __tablename__ = 'quizes'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[str]
    timeLimit: Mapped[int]
    passingScore: Mapped[int]
    shuffleQuestions: Mapped[bool]
    questions: Mapped[str]
    responses: Mapped[str]
    views: Mapped[str]
    status: Mapped[str]
    lastResponse: Mapped[int]
    authorId: Mapped[str]
    createdAt: Mapped[int] = mapped_column(nullable=True, default=int(datetime.now(timezone.utc).timestamp()))
    quiz_id: Mapped[str] = mapped_column(nullable=True, unique=True)
    copies: Mapped[int] = mapped_column(default=0, nullable=True)
    ratings: Mapped[str] = mapped_column(nullable=True)
    language: Mapped[str] = mapped_column(nullable=True)
    difficulty: Mapped[str] = mapped_column(nullable=True)
    topics: Mapped[str] = mapped_column(nullable=True)
    learnings: Mapped[str] = mapped_column(nullable=True)
    requirements: Mapped[str] = mapped_column(nullable=True)

    __table_args__ = (ForeignKeyConstraint(['authorId'], ['users.uuid'], name='fk_surveys_users_uuid'),)

class Confirmation(Base):
    __tablename__ = 'confirmations'

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str]
    item_id: Mapped[str] = mapped_column(nullable=True)
    user_id: Mapped[str]
    author_id: Mapped[str] = mapped_column(nullable=True)
    token: Mapped[str]
    status: Mapped[str]
    expires_at: Mapped[int] = mapped_column(BigInteger)

    __table_args__ = (ForeignKeyConstraint(['user_id'], ['users.uuid'], name='fk_confirmations_users_uuid'), ForeignKeyConstraint(['author_id'], ['users.uuid'], name='fk_confirmations_users_uuid_2'))

class QuizResponse(Base):
    __tablename__ = 'quiz_responses'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str]
    quiz_id: Mapped[str]
    score: Mapped[int]
    totalPoints: Mapped[int]
    maxPoints: Mapped[int]
    completedAt: Mapped[int] = mapped_column(BigInteger)
    timeTaken: Mapped[str]
    
    __table_args__ = (ForeignKeyConstraint(['user_id'], ['users.uuid'], name='fk_quiz_responses_users_uuid'), ForeignKeyConstraint(['quiz_id'], ['quizes.quiz_id'], name='fk_quiz_responses_quizes_quiz_id'))

class Notification(Base):
    __tablename__ = 'notifications'

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str]
    title: Mapped[str]
    message: Mapped[str]
    time: Mapped[int] = mapped_column(nullable=True, default=int(datetime.now(timezone.utc).timestamp()))
    read: Mapped[bool] = mapped_column(nullable=True, default=False)
    receiver_id: Mapped[str]

    __table_args__ = (ForeignKeyConstraint(['receiver_id'], ['users.uuid'], name='fk_notifications_users_uuid'),)