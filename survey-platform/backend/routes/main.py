from fastapi import APIRouter, status, HTTPException, Request
from fastapi.responses import JSONResponse

from yagmail import SMTP
from dotenv import load_dotenv
from os import getenv

from database.database import sessionDep
from utils.survey import SurveyControl
from utils.auth import Auth
from utils.quiz import QuizControl
from utils.confirmation import ConfirmationControl
from utils.user import UserControl
from utils.cache import cache

from schemas.main import SendContactSchema, ForgotPasswordSchema, ChangePasswordConfirmationSchema, SendTwoFactorCodeSchema
from other.get_email_html import get_contact_us_html, get_verify_email_html, get_change_password_email, get_two_factor_code_html
from other.generate_code import generate_email_code
from other.check_auth import check_auth_and_token

router = APIRouter()

survey = SurveyControl()
auth = Auth()
quiz = QuizControl()
confirmation = ConfirmationControl()
user = UserControl()

load_dotenv()
EMAIL = getenv('EMAIL_USERNAME')
PASSWORD = getenv('EMAIL_PASSWORD')

yag = SMTP(EMAIL, PASSWORD, smtp_ssl=True)

@router.get('/fetch-dashboard')
async def get_dashboard_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])

    surveys = await survey.get_user_surveys(request.cookies.get('user_id'), session)
    quizes = await quiz.get_user_quizes(request.cookies.get('user_id'), session)

    return JSONResponse(content={'success': True, 'surveys': surveys, 'quizes': quizes}, status_code=status.HTTP_200_OK)

@router.get('/fetch-confirmation/{token}')
async def fetch_confirmation(token: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await confirmation.get_confirmation_by_token(token, session)

    if not res or res.get('authorId') != request.cookies.get('user_id') or res.get('status') == 'success' or res.get('status') == 'error':
        return JSONResponse(content={'success': False}, status_code=status.HTTP_403_FORBIDDEN)
    
    return JSONResponse(content={'success': True, 'confirmation': res}, status_code=status.HTTP_200_OK)

@router.get('/handle-confirm-confirmation/{token}')
async def confirm_route(token: str, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    confirmation_data = await confirmation.get_confirmation_by_token(token, session)
    user_data = await user.get_user(confirmation_data.get('userId'), session)

    confirm_res = await confirmation.confirm(token, user_data.get('username'), session)

    if not confirm_res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Confirmation does not exists.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/submit-contact-us')
async def submit_contact_route(data: SendContactSchema):
    html = await get_contact_us_html(username=data.username if data.username != '' else None, email=data.email, subject=data.subject, message=data.message)

    yag.send(EMAIL, subject=data.subject, contents=html)

    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)

@router.get('/get-dropdown-data')
async def get_user_dropdown_data(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    cached_dropdown_exists = await cache.exists(f'user-dropdown:{user_id}')

    if cached_dropdown_exists:
        cached_dropdown = await cache.get(f'user-dropdown:{user_id}')
        return JSONResponse(content={'success': True, 'user': cached_dropdown}, status_code=status.HTTP_200_OK)
        
    user_data = await user.get_user(user_id, session)

    data = {'avatar': user_data.get('avatar'), 'username': user_data.get('username'), 'email': user_data.get('email'), 'plan': user_data.get('plan')}

    await cache.set(f'user-dropdown:{user_id}', data, ttl=300)

    return JSONResponse(content={'success': True, 'user': data}, status_code=status.HTTP_200_OK)

@router.get('/send-verifying-code')
async def send_code_route(request: Request, session: sessionDep):
    user_data = await user.get_user(request.cookies.get('user_id'), session)

    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    random_code = await generate_email_code()

    print(random_code)

    html = await get_verify_email_html(random_code, user_data.get('username'), user_data.get('email'))

    yag.send(user_data.get('email'), subject=f'Verify your email there!', contents=html)
    
    return JSONResponse(content={'success': True, 'code': random_code}, status_code=status.HTTP_200_OK)

@router.post('/forgot-password-code')
async def forgot_password_route(data: ForgotPasswordSchema, session: sessionDep):
    user_data = await user.get_user_by_email_or_username(data.email, session)

    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')

    random_code = await generate_email_code()

    print(random_code)

    html = await get_verify_email_html(random_code, user_data.get('username'), user_data.get('email'))

    yag.send(user_data.get('email'), subject=f'Verify your email there!', contents=html)
    
    return JSONResponse(content={'success': True, 'code': random_code}, status_code=status.HTTP_200_OK)

@router.post('/send-change-password-email')
async def send_change_password_route(data: ForgotPasswordSchema, session: sessionDep):
    user_data = await user.get_user_by_email_or_username(data.email, session)

    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')

    res = await user.create_change_password_confirmation(user_data.get('uuid'), data.__pydantic_extra__.get('expiresAt'), session)
    
    html = await get_change_password_email(user_data.get('username'), res)

    yag.send(user_data.get('email'), subject='Change password.', contents=html)

    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/get-change-password-confirmation')
async def get_change_password_confirmation_route(data: ChangePasswordConfirmationSchema, session: sessionDep):
    res = await confirmation.get_change_password_confirmation(data.token, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Confirmation have been not found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/send-two-factor-code')
async def send_two_factor_code(data: SendTwoFactorCodeSchema, session: sessionDep):
    random_code = await generate_email_code()

    print(random_code)

    user_data = await user.get_user_by_email_or_username(data.emailOrUsername, session)

    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')

    html = await get_two_factor_code_html(user_data.get('username'), random_code)

    yag.send(user_data.get('email'), subject=f'Two-Factor code there!', contents=html)
    
    return JSONResponse(content={'success': True, 'code': random_code}, status_code=status.HTTP_201_CREATED)

@router.get('/get-items')
async def get_items_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    surveys = await survey.get_surveys(user_id, session)
    quizes = await quiz.get_quizes(user_id, session)

    return JSONResponse(content={'success': True, 'surveys': surveys if surveys else [], 'quizes': quizes if quizes else []}, status_code=status.HTTP_200_OK)