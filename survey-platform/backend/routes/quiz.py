from fastapi import APIRouter, status, HTTPException, Request
from fastapi.responses import JSONResponse

from yagmail import SMTP
from dotenv import load_dotenv
from os import getenv

from database.database import sessionDep
from schemas.quiz import CreateQuizSchema, ShareQuizSchema, RequestRetrySchema, AddResponseSchema, EditQuizSchema, SetQuizRatingSchema
from utils.quiz import QuizControl
from utils.auth import Auth
from utils.user import UserControl
from other.get_email_html import get_share_quiz_html, get_request_quiz_again
from other.check_auth import check_auth_and_token

router = APIRouter()

quiz = QuizControl()
auth = Auth()
user = UserControl()

load_dotenv()
email_username = getenv('EMAIL_USERNAME')
email_password = getenv('EMAIL_PASSWORD')

yag = SMTP(email_username, email_password, smtp_ssl=True)

@router.post('/create-quiz')
async def create_quiz_route(data: CreateQuizSchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])

    res = await quiz.create_quiz(data.model_dump(), session, request.cookies.get('user_id'))

    if not res:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='No credentials.')
    
    return JSONResponse(content={'success': True, 'detail': 'Successfully created new quiz.', 'quiz': res}, status_code=status.HTTP_201_CREATED)

@router.delete('/delete-quiz/{quiz_id}')
async def delete_quiz(quiz_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await quiz.delete_quiz(quiz_id, session)

    if not res:
        return JSONResponse(content={'success': False, 'detail': 'Quiz not found.'}, status_code=status.HTTP_404_NOT_FOUND)
    
    return JSONResponse(content={'success': True, 'detail': 'Successfully deleted a quiz.'}, status_code=status.HTTP_200_OK)

@router.get('/get-quiz/{quiz_id}')
async def get_quiz(quiz_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
        
    res = await quiz.get_quiz(user_id, quiz_id, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Quiz not found.')
    
    return JSONResponse(content={'success': True, 'quiz': res, 'userId': request.cookies.get('user_id')}, status_code=status.HTTP_200_OK)

@router.post('/share-quiz-email')
async def share_quiz(data: ShareQuizSchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    user_data = await user.get_user(request.cookies.get('user_id'), session)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')
    
    html = await get_share_quiz_html(data.quizUrl)

    yag.send(data.toEmail, subject=f'Invite to quiz! From: {user_data.get('email')}', contents=html)

    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)

@router.get('/add-quiz-view/{quiz_id}')
async def add_quiz_view(quiz_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    user_data = await user.get_user(request.cookies.get('user_id'), session)

    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')
    
    res = await quiz.add_view(quiz_id, user_data.get('username'), session)

    if not res:
        return JSONResponse(content={'success': False}, status_code=status.HTTP_409_CONFLICT)
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/add-quiz-response/{quiz_id}')
async def add_quiz_response(quiz_id: str, data: AddResponseSchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await quiz.add_response(quiz_id, data.score, data.totalPoints, data.completedAt, data.maxPoints, data.timeTaken, request.cookies.get('user_id'), session)

    if not res:
        return JSONResponse(content={'success': False}, status_code=status.HTTP_409_CONFLICT)
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/request-quiz-again')
async def request_quiz_again(data: RequestRetrySchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_data = await user.get_user(request.cookies.get('user_id'), session)

    author = await quiz.get_author(data.quizId, session)

    if not user or not author:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')
    
    token = await quiz.create_request_confirmation(author.get('id'), request.cookies.get('user_id'), data.quizId, data.expiresAt, session)
        
    html = await get_request_quiz_again(user_data.get('username'), data.quizId, data.quizName, token)

    yag.send(author.get('email'), subject=f'Request from user! From: {user_data.get('email')}', contents=html)

    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)

@router.get('/quiz-request-accept/{quiz_id}/{username}')
async def quiz_accept_request(quiz_id: str, username: str, session: sessionDep):
    res = await quiz.reset_response(quiz_id, username, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User or quiz not found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.get('/get-quiz-leaderboard/{quiz_id}')
async def get_leaderboard(quiz_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    leaderboard = await quiz.get_leaderboard(quiz_id, session)

    return JSONResponse(content={'success': True, 'leaderboard': leaderboard[0], 'quizName': leaderboard[1]}, status_code=status.HTTP_200_OK)

@router.get('/create-quiz-copy/{quiz_id}')
async def create_quiz_copy(quiz_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await quiz.create_copy(quiz_id, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Quiz have not been found.')
    
    return JSONResponse(content={'success': True, 'quiz': res}, status_code=status.HTTP_200_OK)

@router.get('/get-quiz-details/{quiz_id}')
async def get_quiz_details(quiz_id: str, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    details = await quiz.get_quiz_details(user_id, quiz_id, session)

    if not details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Quiz or author has not been found.')
    
    return JSONResponse(content={'success': True, 'details': details}, status_code=status.HTTP_200_OK)

@router.put('/update-quiz')
async def update_quiz_route(data: EditQuizSchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    res = await quiz.update_quiz(user_id, data.quiz_id, data.__pydantic_extra__, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Quiz have not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/set-quiz-rating')
async def set_quiz_rating_route(data: SetQuizRatingSchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    res = await quiz.set_quiz_rating(user_id, data.quizId, data.rating, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Quiz have not been found.')

    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)