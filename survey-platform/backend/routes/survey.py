from fastapi import APIRouter, Request, status, HTTPException
from fastapi.responses import JSONResponse

from yagmail import SMTP

from dotenv import load_dotenv
from os import getenv

from schemas.survey import CreateSurveySchema, ShareSurveySchema, RequestAgainSchema, UpdateSurveySchema, SetSurveyRatingSchema
from database.database import sessionDep
from utils.auth import Auth
from utils.survey import SurveyControl
from utils.user import UserControl
from other.get_email_html import get_share_survey_html, get_request_survey_again
from other.check_auth import check_auth_and_token

router = APIRouter()

auth = Auth()
survey = SurveyControl()
user = UserControl()

load_dotenv()

email_username = getenv('EMAIL_USERNAME')
email_password = getenv('EMAIL_PASSWORD')

yag = SMTP(email_username, email_password, smtp_ssl=True)

@router.post('/create-survey')
async def create_survey_route(data: CreateSurveySchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await survey.create_survey(data.title, data.description, data.questions, data.language, data.difficulty, data.tags, session, request.cookies.get('user_id'))

    if not res:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='No credentials.')
    
    return JSONResponse(content={'success': True, 'detail': 'Sucessfully created new survey.', 'survey': res}, status_code=status.HTTP_201_CREATED)

@router.get('/get-survey/{survey_id}')
async def get_survey_route(survey_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
        
    res = await survey.get_survey(user_id, survey_id, session)

    if not res:
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Survey not found.')
    
    return JSONResponse(content={'success': True, 'survey': res, 'userId': request.cookies.get('user_id')}, status_code=status.HTTP_200_OK)

@router.delete('/delete-survey/{survey_id}')
async def delete_survey(survey_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await survey.delete_survey(survey_id, session)

    if not res:
        return JSONResponse(content={'success': False, 'detail': 'Survey not found.'}, status_code=status.HTTP_404_NOT_FOUND)
    
    return JSONResponse(content={'success': True, 'detail': 'Successfully deleted a survey.'}, status_code=status.HTTP_200_OK)

@router.post('/share-survey-email')
async def share_survey_email(data: ShareSurveySchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    user_data = await user.get_user(request.cookies.get('user_id'), session)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')
    
    html = await get_share_survey_html(data.surveyUrl)

    yag.send(data.toEmail, subject=f'Invite to survey! From: {user_data.get('email')}', contents=html)

    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)

@router.get('/add-survey-view/{survey_id}')
async def add_survey_view(survey_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    user_data = await user.get_user(request.cookies.get('user_id'), session)

    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')
    
    res = await survey.add_view(survey_id, user_data.get('username'), session)

    if not res:
        return JSONResponse(content={'success': False}, status_code=status.HTTP_409_CONFLICT)
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.get('/add-survey-response/{survey_id}')
async def add_survey_response(survey_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await survey.add_response(survey_id, request.cookies.get('user_id'), session)

    if not res:
        return JSONResponse(content={'success': False}, status_code=status.HTTP_409_CONFLICT)
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/request-survey-again')
async def request_survey_again(data: RequestAgainSchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
        
    user_data = await user.get_user(user_id, session)

    author = await survey.get_author(data.surveyId, session)

    if not user or not author:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found.')
    
    survey_data = await survey.get_survey(user_id, data.surveyId, session)

    if not survey_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Survey have not been found.')
    
    token = await survey.create_request_confirmation(author.get('id'), user_id, data.surveyId, data.expiresAt, session)
        
    html = await get_request_survey_again(user_data.get('username'), data.surveyId, survey_data.get('title'), token)

    yag.send(author.get('email'), subject=f'Request from user! From: {user_data.get('email')}', contents=html)
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)

@router.get('/create-survey-copy/{survey_id}')
async def create_survey_copy(survey_id: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await survey.create_copy(survey_id, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Survey have not been found.')
    
    return JSONResponse(content={'success': True, 'survey': res}, status_code=status.HTTP_200_OK)

@router.get('/get-survey-details/{survey_id}')
async def get_survey_details(survey_id: str, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    details = await survey.get_survey_details(user_id, survey_id, session)

    if not details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Survey or author has not been found.')
    
    return JSONResponse(content={'success': True, 'details': details}, status_code=status.HTTP_200_OK)

@router.put('/update-survey')
async def update_survey_route(data: UpdateSurveySchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    res = await survey.update_survey(data.surveyId, user_id, data.__pydantic_extra__, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Survey have not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/set-survey-rating')
async def set_survey_rating_route(data: SetSurveyRatingSchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    res = await survey.set_survey_rating(user_id, data.surveyId, data.rating, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Survey have not been found.')

    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)