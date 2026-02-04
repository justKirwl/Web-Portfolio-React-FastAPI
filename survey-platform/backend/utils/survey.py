from sqlalchemy import select

from json import dumps, loads
from uuid import uuid4
from datetime import datetime, timezone

from database.models import Survey, User, Confirmation, Quiz
from database.database import sessionDep
from other.get_last_response import get_last_response

from utils.cache import cache
from utils.notif import Notify
from utils.user import UserControl

notify = Notify()
user = UserControl()

class SurveyControl:

    async def create_survey(self, title: str, description: str, questions: list, language: str, difficulty: str, tags: list, session: sessionDep, user_id: str) -> dict[str, str | int] | bool:
        stmt_user = select(User).where(User.uuid == user_id)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        if not res:
            return False
        
        UUID = str(uuid4())

        new_survey = Survey(title=title, description=description, questions=dumps(questions), authorId=user.uuid, status='active', views=dumps([]), lastResponse=0, responses=dumps([]), survey_id=UUID, ratings=dumps([]), language=language, difficulty=difficulty, tags=dumps(tags), lastUpdated=0)

        session.add(new_survey)

        ach_list = loads(user.achievements)
        log_list = loads(user.activityLog)

        ach_exists = False

        quiz_survey_stmt = select(Quiz, Survey).where(Quiz.authorId == user_id, Survey.authorId == user_id)
        res = await session.execute(quiz_survey_stmt)
        quiz_surveys = res.scalars().all()

        for ach in ach_list:
            if 'first_product' in ach.get('id'):
                ach_exists = True

        if not ach_exists and not quiz_surveys:
            ach_list.append({'id': 'first_product', 'date': int(datetime.now(timezone.utc).timestamp())})
            await cache.delete(f'user-achievements:{user_id}')
            user.achievements = dumps(ach_list)

        if user.trackActivity:
            if len(log_list) >= 6:
                del log_list[0]

            log_list.append({'action': 'Created', 'item': title, 'time': int(datetime.now(timezone.utc).timestamp())})
            await notify.add_notification({'type': 'info', 'title': 'New Achieve', 'message': f"You got new achieve for first built product!", 'receiver_id': user.uuid}, session)
            await cache.delete(f'user-activity:{user_id}')

            user.activityLog = dumps(log_list)

        await session.commit()
        await session.refresh(new_survey)

        last_response = await get_last_response(new_survey.lastResponse, user.language)

        return {'id': new_survey.id, 'title': new_survey.title, 'type': 'survey', 'responses': new_survey.responses, 'views': new_survey.views, 'status': new_survey.status, 'createdAt': new_survey.createdAt, 'lastResponse': last_response}
    
    async def get_user_surveys(self, user_id: str, session: sessionDep) -> list[dict[str, str | int]]:
        stmt_surveys = select(Survey).where(Survey.authorId == user_id)
        response = await session.execute(stmt_surveys)
        surveys = response.scalars().all()

        if not surveys:
            return []
        
        surveys_list = []

        user_language = await user.get_user_language(user_id, session)
        
        for survey in surveys:
            last_response = await get_last_response(survey.lastResponse, user_language if user_language else 'en')

            surveys_list.append({'id': survey.survey_id, 'title': survey.title, 'type': 'survey', 'responses': survey.responses, 'views': survey.views, 'status': survey.status, 'createdAt': survey.createdAt, 'lastResponse': last_response})

        return surveys_list
    
    async def get_survey(self, user_id: str, survey_id: str, session: sessionDep) -> dict[str, str | int] | bool:
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        response = await session.execute(stmt_survey)
        survey = response.scalar_one_or_none()

        if not survey:
            return False
        
        user_language = await user.get_user_language(user_id, session)
        
        last_response = await get_last_response(survey.lastResponse, user_language if user_language else 'en')
        
        return {'id': survey.survey_id, 'title': survey.title, 'description': survey.description, 'questions': survey.questions, 'responses': survey.responses, 'views': survey.views, 'lastResponse': last_response, 'status': survey.status, 'createdAt': survey.createdAt, 'authorId': survey.authorId, 'language': survey.language, 'difficulty': survey.difficulty, 'tags': loads(survey.tags)}

    async def delete_survey(self, survey_id: str, session: sessionDep) -> bool:
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        response = await session.execute(stmt_survey)
        survey = response.scalar_one_or_none()

        if not survey:
            return False
        
        await session.delete(survey)
        await session.commit()

        return True
    
    async def add_view(self, survey_id: str, username: str, session: sessionDep) -> bool:
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()

        if not survey:
            return False
        
        survey_views = loads(survey.views)

        if username in survey_views:
            return False

        survey_views.append(username)

        survey.views = dumps(survey_views)

        stmt_author = select(User).where(User.uuid == survey.authorId)
        res = await session.execute(stmt_author)
        author = res.scalar_one_or_none()

        author_ach_list = loads(author.achievements)

        ach_exists = False

        for ach in author_ach_list:
            if 'first_view' in ach.get('id'):
                ach_exists = True

        if not ach_exists:
            author_ach_list.append({'id': 'first_view', 'date': int(datetime.now(timezone.utc).timestamp())})
            await cache.delete(f'user-achievements:{author.uuid}')
            author.achievements = dumps(author_ach_list)     

        await session.commit()

        return True
    
    async def add_response(self, survey_id: str, user_id: str, session: sessionDep) -> bool:
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()

        if not survey:
            return False
        
        survey_responses = loads(survey.responses)

        if user_id in survey_responses:
            return False
        
        stmt_user = select(User).where(User.uuid == user_id)
        res = await session.execute(stmt_user)
        user_ = res.scalar_one_or_none()

        if not user_:
            return False
            
        responses_list = loads(user_.responses)
        ach_list = loads(user_.achievements)
        log_list = loads(user_.activityLog)

        ach_exists = False

        for ach in ach_list:
            if 'first_response' in ach.get('id'):
                ach_exists = True

        if not ach_exists:
            ach_list.append({'id': 'first_response', 'date': int(datetime.now(timezone.utc).timestamp())})

            await notify.add_notification({'type': 'info', 'title': 'New Achieve', 'message': f'You got achieve for first fly into this adventure!', 'receiver_id': user_.uuid}, session)

            await cache.delete(f'user-achievements:{user_id}')
            await cache.delete(f'user-notif:{user_.uuid}')
            user_.achievements = dumps(ach_list)

        if user_.trackActivity:
            if len(log_list) >= 6:
                del log_list[0]
            
            log_list.append({'action': 'Answered', 'item': survey.title, 'time': int(datetime.now(timezone.utc).timestamp())})
            await cache.delete(f'user-activity:{user_id}')

            user_.activityLog = dumps(log_list)

        responses_list.append(survey_id)

        user_.responses = dumps(responses_list)
        
        survey_responses.append(user_id)
        survey.lastResponse = int(datetime.now(timezone.utc).timestamp())

        survey.responses = dumps(survey_responses)

        stmt_author = select(User).where(User.uuid == survey.authorId)
        res = await session.execute(stmt_author)
        author = res.scalar_one_or_none()

        author_ach_list = loads(author.achievements)

        ach_exists = False

        for ach in author_ach_list:
            if 'first_customer' in ach.get('id'):
                ach_exists = True

        if not ach_exists:
            ach_list.append({'id': 'first_customer', 'date': int(datetime.now(timezone.utc).timestamp())})
            await cache.delete(f'user-achievements:{author.uuid}')
            author.achievements = dumps(author_ach_list)

        await notify.add_notification({'type': 'info', 'title': 'New Response', 'message': f'@{user_.username} responsed to your survey - {survey.title}', 'receiver_id': author.uuid}, session)
        await session.commit()

        await cache.delete(f'user-notif:{author.uuid}')

        return True
    
    async def reset_response(self, survey_id: str, username: str, session: sessionDep) -> bool:
        stmt_user = select(User).where(User.username == username)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        if not user:
            return False

        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()

        if not survey:
            return False
        
        survey_responses = loads(survey.responses)

        if user.uuid not in survey_responses:
            return False
        
        stmt_user = select(User).where(User.username == username)
        res = await session.execute(stmt_user)
        user_ = res.scalar_one_or_none()

        if not user_:
            return False
            
        responses_list = loads(user_.responses)

        responses_list.remove(survey_id)

        user_.responses = dumps(responses_list)
        
        survey_responses.remove(user.uuid)

        survey.responses = dumps(survey_responses)
        await session.commit()

        return True
    
    async def get_author(self, survey_id: str, session: sessionDep):
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()

        if not survey:
            return False
        
        stmt_user = select(User).where(User.uuid == survey.authorId)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        if not user:
            return False
        
        return {'id': user.uuid, 'username': user.username, 'email': user.email, 'avatar': user.avatar}
    
    async def create_request_confirmation(self, author_id: str, user_id: str, survey_id: str, expires_at: int, session: sessionDep) -> str:
        UUID = str(uuid4())

        new_confirmation = Confirmation(type='survey_accept', item_id=survey_id, author_id=author_id, user_id=user_id, token=UUID, status='pending', expires_at=expires_at)

        session.add(new_confirmation)
        await session.commit()

        return UUID
    
    async def create_copy(self, survey_id: str, session: sessionDep):
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()

        if not survey:
            return False
        
        UUID = str(uuid4())

        new_survey = Survey(title=f'{survey.title} ({survey.copies + 1})', description=survey.description, questions=survey.questions, authorId=survey.authorId, status='not active', views=dumps([]), lastResponse=0, responses=dumps([]), survey_id=UUID)

        session.add(new_survey)
        survey.copies = survey.copies + 1
        await session.commit()
        await session.refresh(new_survey)

        return {'id': new_survey.survey_id, 'title': new_survey.title, 'type': 'survey', 'responses': new_survey.responses, 'views': new_survey.views, 'status': new_survey.status, 'createdAt': new_survey.createdAt, 'lastResponse': new_survey.lastResponse}
    
    async def get_surveys(self, except_user_id: str, session: sessionDep) -> list[dict] | bool:
        stmt_surveys = select(Survey).where(Survey.authorId != except_user_id)
        res = await session.execute(stmt_surveys)
        surveys = res.scalars().all()

        if not surveys:
            return False
        
        surveys_list = []

        for survey in surveys:
            stmt_user = select(User).where(User.uuid == survey.authorId)
            res = await session.execute(stmt_user)
            user = res.scalar_one_or_none()

            surveys_list.append({'id': survey.survey_id, 'title': survey.title, 'type': 'surveys', 'author': user.username if user else 'Unknown', 'views': len(loads(survey.views)), 'responses': len(loads(survey.responses)), 'questions': len(loads(survey.questions)), 'date': survey.createdAt, 'featured': False, 'isCompleted': except_user_id in loads(survey.responses)})

        return surveys_list
    
    async def get_survey_details(self, user_id: str, survey_id: str, session: sessionDep) -> dict | bool:
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()

        if not survey:
            return False
        
        stmt_user = select(User).where(User.uuid == survey.authorId)
        res = await session.execute(stmt_user)
        user_ = res.scalar_one_or_none()

        rate_list = loads(survey.ratings)

        rating_numbers = [d['rating'] for d in rate_list] if rate_list else None

        user_language = await user.get_user_language(user_id, session)

        never_statement = 'Никогда' if user_language == 'ru' else 'Never'

        last_updated = await get_last_response(survey.lastUpdated, user_language if user_language else 'en') if survey.lastUpdated != 0 else never_statement

        return {'id': survey.survey_id, 'title': survey.title, 'description': survey.description, 'author': user_.username, 'authorAvatar': user_.avatar, 'views': loads(survey.views), 'responses': len(loads(survey.responses)), 'questions': len(loads(survey.questions)), 'estimatedTime': '...', 'rating': sum(rating_numbers) / len(rating_numbers) if rating_numbers else 0, 'totalRatings': len(rating_numbers) if rating_numbers else 0, 'createdAt': survey.createdAt, 'lastUpdated': last_updated, 'difficulty': survey.difficulty, 'language': survey.language, 'tags': loads(survey.tags), 'isCompleted': user_id in loads(survey.responses)}
    
    async def update_survey(self, survey_id: str, user_id: str, items_to_update: dict, session: sessionDep) -> bool:
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()

        if not survey or survey.authorId != user_id:
            return False
        
        stmt_user = select(User).where(User.uuid == user_id)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        log_list = loads(user.activityLog)
        
        for key, value in items_to_update.items():
            if not hasattr(survey, key):
                continue

            if isinstance(value, list):
                setattr(survey, key, dumps(value))
                continue

            setattr(survey, key, value)
        
        if user.trackActivity:
            if len(log_list) >= 6:
                del log_list[0]

            log_list.append({'action': 'Updated', 'item': survey.title, 'time': int(datetime.now(timezone.utc).timestamp())})
            await cache.delete(f'user-activity:{user_id}')

            user.activityLog = dumps(log_list)

        survey.lastUpdated = int(datetime.now(timezone.utc).timestamp())
        
        await session.commit()

        return True
    
    async def set_survey_rating(self, user_id: str, survey_id: str, rating: int, session: sessionDep) -> bool:
        stmt_survey = select(Survey).where(Survey.survey_id == survey_id)
        res = await session.execute(stmt_survey)
        survey = res.scalar_one_or_none()

        if not survey:
            return False
        
        rate_list = loads(survey.ratings)

        if rate_list:
            for index, rate in enumerate(rate_list):
                if rate['user_id'] == user_id:
                    del rate_list[index]

        rate_list.append({'user_id': user_id, 'rating': rating})

        survey.ratings = dumps(rate_list)

        user_session = await user.get_user_session(user_id, session)

        user_rating_list = loads(user_session.ratings)

        user_rating_list.append(rating)

        user_session.ratings = dumps(user_rating_list)

        await session.commit()

        return True