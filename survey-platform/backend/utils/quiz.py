from sqlalchemy import select

from json import dumps, loads
from uuid import uuid4
from datetime import datetime, timezone

from typing import Any

from database.database import sessionDep
from database.models import Quiz, User, Confirmation, QuizResponse, Survey

from other.get_last_response import get_last_response
from utils.user import UserControl
from utils.cache import cache
from utils.notif import Notify

user = UserControl()
notify = Notify()

class QuizControl:

    async def create_quiz(self, quiz_args: dict[str, Any], session: sessionDep, user_id: str) -> dict[str, str | int] | bool:
        stmt_user = select(User).where(User.uuid == user_id)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        if not user:
            return False
        
        UUID = str(uuid4())

        for key, value in quiz_args.items():
            if isinstance(value, (list, dict, tuple)):
                quiz_args[key] = dumps(value)
        
        new_quiz = Quiz(**quiz_args, authorId=user.uuid, status='active', views=dumps([]), lastResponse=0, responses=dumps([]), quiz_id=UUID, ratings=dumps([]))

        session.add(new_quiz)

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

            log_list.append({'action': 'Created', 'item': new_quiz.title, 'time': int(datetime.now(timezone.utc).timestamp())})
            await notify.add_notification({'type': 'info', 'title': 'New Achieve', 'message': f"You got new achieve for first built product!", 'receiver_id': user.uuid}, session)
            await cache.delete(f'user-activity:{user_id}')

            user.activityLog = dumps(log_list)

        await session.commit()
        await session.refresh(new_quiz)

        last_response = await get_last_response(new_quiz.lastResponse, user.language)

        return {'id': new_quiz.id, 'title': new_quiz.title, 'type': 'quiz', 'responses': new_quiz.responses, 'views': new_quiz.views, 'status': new_quiz.status, 'createdAt': new_quiz.createdAt, 'lastResponse': last_response}
    
    async def get_user_quizes(self, user_id: str, session: sessionDep) -> list[dict[str, str | int]]:
        stmt_quizes = select(Quiz).where(Quiz.authorId == user_id)
        response = await session.execute(stmt_quizes)
        quizes = response.scalars().all()

        if not quizes:
            return []
        
        quizes_list = []

        user_language = await user.get_user_language(user_id, session)

        for quiz in quizes:
            last_response = await get_last_response(quiz.lastResponse, user_language if user_language else 'en')

            quizes_list.append({'id': quiz.quiz_id, 'title': quiz.title, 'type': 'quiz', 'responses': quiz.responses, 'views': quiz.views, 'status': quiz.status, 'createdAt': quiz.createdAt, 'lastResponse': last_response})

        return quizes_list
    
    async def delete_quiz(self, quiz_id: str, session: sessionDep) -> bool:
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        await session.delete(quiz)
        await session.commit()

        return True
    
    async def get_quiz(self, user_id: str, quiz_id: str, session: sessionDep) -> dict[str, str | int] | bool:
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        user_language = await user.get_user_language(user_id, session)
        
        last_response = await get_last_response(quiz.lastResponse, user_language if user_language else 'en')
        
        stmt_quiz_responses = select(QuizResponse).where(QuizResponse.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz_responses)
        quiz_responses = res.scalars().all()

        score_list = [response.score for response in quiz_responses] if quiz_responses else []
        avg_score = int(sum(score_list) / len(score_list)) if score_list else 0
        
        return {'quiz_id': quiz.quiz_id, 'title': quiz.title, 'description': quiz.description, 'questions': loads(quiz.questions), 'createdAt': quiz.createdAt, 'responses': quiz.responses, 'views': quiz.views, 'passingScore': quiz.passingScore, 'shuffleQuestions': quiz.shuffleQuestions, 'timeLimit': quiz.timeLimit, 'status': quiz.status, 'lastResponse': last_response, 'averageScore': avg_score, 'authorId': quiz.authorId, 'language': quiz.language, 'difficulty': quiz.difficulty, 'topics': loads(quiz.topics), 'learnings': loads(quiz.learnings), 'requirements': loads(quiz.requirements)}
    
    async def add_view(self, quiz_id: str, username: str, session: sessionDep) -> bool:
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        quiz_views = loads(quiz.views)

        if username in quiz_views:
            return False

        quiz_views.append(username)

        quiz.views = dumps(quiz_views)
        await session.commit()

        stmt_author = select(User).where(User.uuid == quiz.authorId)
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

        return True
    
    async def add_response(self, quiz_id: str, score: int, totalPoints: int, completedAt: int, maxPoints: int, timeTaken: str, user_id: str, session: sessionDep) -> bool:
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        quiz_responses = loads(quiz.responses)

        if user_id in quiz_responses:
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

            await notify.add_notification({'type': 'info', 'title': 'New Achieve', 'message': f"You got new achieve for first fly into this adventure!", 'receiver_id': user_.uuid}, session)

            await cache.delete(f'user-achievements:{user_id}')
            await cache.delete(f'user-notif:{user_.uuid}')
            user_.achievements = dumps(ach_list)

        if user_.trackActivity:
            if len(log_list) >= 6:
                del log_list[0]

            log_list.append({'action': 'Completed', 'item': quiz.title, 'time': int(datetime.now(timezone.utc).timestamp())})
            
            await cache.delete(f'user-activity:{user_id}')

            user_.activityLog = dumps(log_list)

        responses_list.append(quiz_id)

        user_.responses = dumps(responses_list)
        
        quiz_response = QuizResponse(user_id=user_id, score=score, totalPoints=totalPoints, completedAt=completedAt, timeTaken=timeTaken, maxPoints=maxPoints, quiz_id=quiz_id)
        
        quiz_responses.append(user_id)

        quiz.responses = dumps(quiz_responses)
        quiz.lastResponse = int(datetime.now(timezone.utc).timestamp())

        session.add(quiz_response)

        stmt_author = select(User).where(User.uuid == quiz.authorId)
        res = await session.execute(stmt_author)
        author = res.scalar_one_or_none()

        author_ach_list = loads(author.achievements)

        ach_exists = False

        for ach in author_ach_list:
            if 'first_customer' in ach.get('id'):
                ach_exists = True

        if not ach_exists:
            author_ach_list.append({'id': 'first_customer', 'date': int(datetime.now(timezone.utc).timestamp())})
            await cache.delete(f'user-achievements:{author.uuid}')
            author.achievements = dumps(author_ach_list)

        await notify.add_notification({'type': 'info', 'title': 'New Response', 'message': f'@{user_.username} responsed to your quiz - {quiz.title}', 'receiver_id': author.uuid}, session)
        await session.commit()

        await cache.delete(f'user-notif:{author.uuid}')

        return True
    
    async def get_author(self, quiz_id: str, session: sessionDep) -> dict | bool:
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        stmt_user = select(User).where(User.uuid == quiz.authorId)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        if not user:
            return False
        
        return {'id': user.uuid, 'username': user.username, 'email': user.email, 'avatar': user.avatar}
    
    async def reset_response(self, quiz_id: str, username: str, session: sessionDep) -> bool:
        stmt_user = select(User).where(User.username == username)
        res = await session.execute(stmt_user)
        user_ = res.scalar_one_or_none()

        if not user:
            return False
        
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        quiz_responses = loads(quiz.responses)

        if user_.uuid not in quiz_responses:
            return False
        
        stmt_quiz_response = select(QuizResponse).where(QuizResponse.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz_response)
        quiz_response = res.scalar_one_or_none()

        if not quiz_response:
            return False
        
        responses_list = loads(user_.responses)

        responses_list.append(quiz_id)

        user_.responses = dumps(responses_list)
        
        quiz_responses.remove(user_.uuid)

        quiz.responses = dumps(quiz_responses)

        await session.delete(quiz_response)
        await session.commit()

        return True
    
    async def create_request_confirmation(self, author_id: str, user_id: str, quiz_id: str, expires_at: int, session: sessionDep) -> str:
        UUID = str(uuid4())

        new_confirmation = Confirmation(type='quiz_accept', item_id=quiz_id, author_id=author_id, user_id=user_id, token=UUID, status='pending', expires_at=expires_at)

        session.add(new_confirmation)
        await session.commit()

        return UUID
    
    async def get_leaderboard(self, quiz_id: str, session: sessionDep) -> tuple[list[dict], str] | list:
        stmt_quiz_responses = select(QuizResponse).where(QuizResponse.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz_responses)
        quiz_responses = res.scalars().all()

        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz_responses:
            return [], quiz.title
        
        quiz_responses_list = []

        for response in quiz_responses:
            user = await user.get_user(response.user_id, session)

            if not user:
                return
            
            quiz_responses_list.append({'id': response.id, 'name': user.get('username'), 'score': response.score, 'totalPoints': response.totalPoints, 'maxPoints': response.maxPoints, 'completedAt': response.completedAt, 'timeTaken': response.timeTaken})

        sorted_responses = sorted(quiz_responses_list, key=lambda d: d['score'], reverse=True)

        if not quiz:
            return sorted_responses, 'Not found.'

        return sorted_responses, quiz.title
    
    async def create_copy(self, quiz_id: str, session: sessionDep):
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        UUID = str(uuid4())

        new_quiz = Quiz(title=f'{quiz.title} ({quiz.copies + 1})', description=quiz.description, timeLimit=quiz.timeLimit, passingScore=quiz.passingScore, shuffleQuestions=quiz.shuffleQuestions, questions=quiz.questions, authorId=quiz.authorId, status='not active', views=dumps([]), lastResponse=0, responses=dumps([]), quiz_id=UUID)

        session.add(new_quiz)
        quiz.copies = quiz.copies + 1
        await session.commit()
        await session.refresh(new_quiz)

        return {'id': new_quiz.quiz_id, 'title': new_quiz.title, 'type': 'quiz', 'responses': new_quiz.responses, 'views': new_quiz.views, 'status': new_quiz.status, 'createdAt': new_quiz.createdAt, 'lastResponse': new_quiz.lastResponse}
    
    async def get_quizes(self, except_user_id: str, session: sessionDep) -> list[dict] | bool:
        stmt_quizes = select(Quiz).where(Quiz.authorId != except_user_id)
        res = await session.execute(stmt_quizes)
        quizes = res.scalars().all()

        if not quizes:
            return False
        
        quizes_list = []

        for quiz in quizes:
            stmt_user = select(User).where(User.uuid == quiz.authorId)
            res = await session.execute(stmt_user)
            user = res.scalar_one_or_none()

            quizes_list.append({'id': quiz.quiz_id, 'title': quiz.title, 'type': 'quizes', 'author': user.username if user else 'Unknown', 'views': len(loads(quiz.views)), 'responses': len(loads(quiz.responses)), 'questions': len(loads(quiz.questions)), 'date': quiz.createdAt, 'featured': False, 'isCompleted': except_user_id in loads(quiz.responses)})

        return quizes_list
    
    async def get_quiz_details(self, user_id: str, quiz_id: str, session: sessionDep) -> dict | bool:
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        stmt_user = select(User).where(User.uuid == quiz.authorId)
        res = await session.execute(stmt_user)
        user = res.scalar_one_or_none()

        rate_list = loads(quiz.ratings)

        rating_numbers = [d['rating'] for d in rate_list] if rate_list else None

        stmt_quiz_responses = select(QuizResponse).where(QuizResponse.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz_responses)
        quiz_responses = res.scalars().all()

        responses_list = [response.score for response in quiz_responses] if quiz_responses else None
        
        return {'id': quiz.quiz_id, 'title': quiz.title, 'description': quiz.description, 'author': {'name': user.displayName, 'avatar': user.avatar}, 'stats': {'questions': len(loads(quiz.questions)), 'timeLimit': quiz.timeLimit, 'attempts': len(loads(quiz.responses)), 'avgScore': round(sum(responses_list) / len(responses_list)) if responses_list else 0, 'passRate': quiz.passingScore, 'rating': sum(rating_numbers) / len(rating_numbers) if rating_numbers else 0, 'totalRatings': len(rating_numbers) if rating_numbers else 0, 'totalPoints': sum([d['points'] for d in loads(quiz.questions)])}, 'difficulty': quiz.difficulty, 'topics': loads(quiz.topics), 'learnings': loads(quiz.learnings), 'requirements': loads(quiz.requirements), 'isCompleted': user_id in loads(quiz.responses)}
    
    async def update_quiz(self, user_id: str, quiz_id: str, items_to_update: dict, session: sessionDep) -> bool:
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz or quiz.authorId != user_id:
            return False
        
        user_session = await user.get_user_session(user_id, session)

        if not user_session:
            return False
        
        log_list = loads(user_session.activityLog)

        for key, value in items_to_update.items():
            if not hasattr(quiz, key):
                continue

            if isinstance(value, list):
                setattr(quiz, key, dumps(value))
                continue

            setattr(quiz, key, value)

        if user_session.trackActivity:
            if len(log_list) >= 6:
                del log_list[0]

            log_list.append({'action': 'Updated', 'item': quiz.title, 'time': int(datetime.now(timezone.utc).timestamp())})
            await cache.delete(f'user-activity:{user_id}')

            user_session.activityLog = dumps(log_list)

        await session.commit()

        return True
    
    async def set_quiz_rating(self, user_id: str, quiz_id: str, rating: int, session: sessionDep) -> bool:
        stmt_quiz = select(Quiz).where(Quiz.quiz_id == quiz_id)
        res = await session.execute(stmt_quiz)
        quiz = res.scalar_one_or_none()

        if not quiz:
            return False
        
        rate_list = loads(quiz.ratings)

        if rate_list:
            for index, rate in enumerate(rate_list):
                if rate['user_id'] == user_id:
                    del rate_list[index]

        rate_list.append({'user_id': user_id, 'rating': rating})

        quiz.ratings = dumps(rate_list)

        user_session = await user.get_user_session(user_id, session)

        user_rating_list = loads(user_session.ratings)

        user_rating_list.append(rating)

        user_session.ratings = dumps(user_rating_list)

        await session.commit()

        return True