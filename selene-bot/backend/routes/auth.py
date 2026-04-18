from fastapi import APIRouter, Request, status, Response, BackgroundTasks
from fastapi.responses import JSONResponse

from yagmail import SMTP

from dotenv import load_dotenv
from os import getenv

from werkzeug.security import generate_password_hash, check_password_hash
from json import dumps, loads

from typing import Union

from brevo import Brevo, SendTransacEmailRequestSender, SendTransacEmailRequestToItem

from database.database import SessionDep

from utils.cache import cache
from utils.auth import Auth
from utils.user import UserControl

from schemas.auth import SendAuthCode, VerifyAuthCode, RegisterSchema

from other.html_templates import get_auth_send_code_html
from other.code_receiver import generate_email_code
from other.check_for_credentials import check_for_credentials

load_dotenv()

EMAIL = getenv('EMAIL')
EMAIL_APP_PASSWORD = getenv('EMAIL_APP_PASSWORD')

BREVO_API_KEY = getenv('BREVO_API_KEY')

brevo_client = Brevo(api_key=BREVO_API_KEY)

router = APIRouter()

user = UserControl()

auth = Auth()

yag = SMTP(user=EMAIL, password=EMAIL_APP_PASSWORD)

@router.post('/send-verification-code')
async def send_code(data: SendAuthCode, request: Request, background_tasks: BackgroundTasks):
    if request.cookies.get('access_token'):
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    
    if await cache.exists(f'auth_code:{data.email}'):
        return JSONResponse(content={'success': False, 'desc': 'Please try again a little later.'}, status_code=status.HTTP_403_FORBIDDEN)
    
    RANDOM_CODE = generate_email_code()

    print(RANDOM_CODE)
    
    html = get_auth_send_code_html(data.email, RANDOM_CODE)

    brevo_response = brevo_client.transactional_emails.send_transac_email(subject='Authorization code', sender=SendTransacEmailRequestSender(email=EMAIL, name='Selene'), to=[SendTransacEmailRequestToItem(email=data.email, name='Receiver')], html_content=html)

    print(brevo_response.message_id)

    await cache.set(f'auth_code:{data.email}', dumps({'hash_code': generate_password_hash(str(RANDOM_CODE), method='pbkdf2:sha256'), 'attempts': 0}), ttl=300)

    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)

@router.post('/verify-auth-code')
async def verify_code(data: VerifyAuthCode, request: Request, session: SessionDep):
    if request.cookies.get('access_token'):
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    
    CACHED_CODE_EXISTS = await cache.exists(f'auth_code:{data.email}')
    
    if not CACHED_CODE_EXISTS:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    
    CACHED_RESPONSE = await cache.get(f'auth_code:{data.email}')
    
    CACHED_CODE: dict[str, Union[str, int]] = loads(CACHED_RESPONSE) if isinstance(CACHED_RESPONSE, str) else CACHED_RESPONSE

    if not check_password_hash(CACHED_CODE['hash_code'], data.code):
        CACHED_CODE['attempts'] += 1

        await cache.raw('set', f'auth_code:{data.email}', dumps(CACHED_CODE), keepttl=True)

        if CACHED_CODE['attempts'] >= 3:
            return JSONResponse(content={'success': False, 'desc': 'Exceeded limit of 3 to enter the code, please wait and try again later'}, status_code=status.HTTP_403_FORBIDDEN)

        return JSONResponse(content={'success': False, 'desc': f'Incorrect code, {3 - CACHED_CODE["attempts"]} attempts left.'}, status_code=status.HTTP_422_UNPROCESSABLE_CONTENT)
    
    if not await auth.check_user_for_exist(data.email, session):
        return JSONResponse(content={'success': True, 'signed_in': False}, status_code=status.HTTP_201_CREATED)
    
    TOKENS = await auth.give_credentials(data.email)
    SESSION_ID, CSRF_TOKEN = await user.create_session(data.email, session)

    response = JSONResponse(content={'success': True, 'signed_in': True}, status_code=status.HTTP_201_CREATED)

    response.set_cookie('access_token', TOKENS[0], max_age=900, secure=True, httponly=True, samesite='none')
    response.set_cookie('refresh_token', TOKENS[1], max_age=604800, secure=True, httponly=True, samesite='none')
    response.set_cookie('csrf_token', CSRF_TOKEN, max_age=604800, secure=True, samesite='none')
    response.set_cookie('session_id', SESSION_ID, max_age=604800, secure=True, httponly=True, samesite='none')

    return response

@router.post('/register-user')
async def register_user(data: RegisterSchema, request: Request, session: SessionDep):
    if request.cookies.get('access_token'):
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    
    REGISTER_RES = await auth.register_user(data.model_dump(), session)

    if not REGISTER_RES:
        return Response(status_code=status.HTTP_409_CONFLICT)
    
    TOKENS = await auth.give_credentials(data.email)

    SESSION_ID, CSRF_TOKEN = await user.create_session(data.email, session)
    
    response = JSONResponse(content={'success': True, 'signed_in': True}, status_code=status.HTTP_201_CREATED)

    response.set_cookie('access_token', TOKENS[0], max_age=900, secure=True, httponly=True, samesite='none')
    response.set_cookie('refresh_token', TOKENS[1], max_age=604800, secure=True, httponly=True, samesite='none')
    response.set_cookie('csrf_token', CSRF_TOKEN, max_age=604800, secure=True, samesite='none')
    response.set_cookie('session_id', SESSION_ID, max_age=604800, secure=True, httponly=True, samesite='none')

    return response

@router.get('/check-auth')
async def check_auth_route(request: Request):
    ACCESS_TOKEN = request.cookies.get('access_token')
    REFRESH_TOKEN = request.cookies.get('refresh_token')

    if not ACCESS_TOKEN and not REFRESH_TOKEN:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if not ACCESS_TOKEN and REFRESH_TOKEN:
        ACCESS_TOKEN_REFRESHED = await auth.refresh_access_token(REFRESH_TOKEN)

        if ACCESS_TOKEN_REFRESHED:
            response = Response(status_code=status.HTTP_200_OK)

            response.set_cookie('access_token', ACCESS_TOKEN_REFRESHED, max_age=900, secure=True, httponly=True, samesite='none')

            return response
        
        response = Response(status_code=status.HTTP_401_UNAUTHORIZED)

        response.delete_cookie('refresh_token', secure=True, httponly=True, samesite='none')
        
        return response
    
    ACCESS_TOKEN_VERIFIED = await auth.verify_access_token(ACCESS_TOKEN)

    if not ACCESS_TOKEN_VERIFIED:
        ACCESS_TOKEN_REFRESHED = await auth.refresh_access_token(REFRESH_TOKEN)

        if ACCESS_TOKEN_REFRESHED:
            response = Response(status_code=status.HTTP_200_OK)

            response.delete_cookie('access_token', secure=True, httponly=True, samesite='none')
            response.set_cookie('access_token', ACCESS_TOKEN_REFRESHED, max_age=900, secure=True, httponly=True, samesite='none')

            return response
        
        response = Response(status_code=status.HTTP_401_UNAUTHORIZED)

        response.delete_cookie('access_token', secure=True, httponly=True, samesite='none')
        response.delete_cookie('refresh_token', secure=True, httponly=True, samesite='none')
        response.delete_cookie('csrf_token', secure=True, samesite='none')
        response.delete_cookie('session_id', secure=True, httponly=True, samesite='none')

        return response
        
    return Response(status_code=status.HTTP_200_OK)

@router.get('/logout')
async def logout_route(request: Request, session: SessionDep):
    if not request.cookies:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    
    response = Response(status_code=status.HTTP_200_OK)

    response.delete_cookie('access_token', secure=True, httponly=True, samesite='none')
    response.delete_cookie('refresh_token', secure=True, httponly=True, samesite='none')
    response.delete_cookie('csrf_token', secure=True, samesite='none')
    response.delete_cookie('session_id', secure=True, httponly=True, samesite='none')

    PAYLOAD = await auth.verify_access_token(request.cookies.get('access_token', ''))

    await user.delete_session(PAYLOAD['email'], request.cookies.get('session_id'), session)

    await cache.delete(f'user-data:{PAYLOAD['email']}')

    return response

@router.get('/get-csrf-token')
async def get_csrf_token_route(request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    SESSION_ID = request.cookies.get('session_id')

    CSRF_TOKEN_KEY = f'csrf-token:{PAYLOAD['email']}:{SESSION_ID}'
    
    IS_CSRF_TOKEN_EXISTS = await cache.exists(CSRF_TOKEN_KEY)

    if IS_CSRF_TOKEN_EXISTS:
        CACHED_CSRF_TOKEN: str = await cache.get(CSRF_TOKEN_KEY)

        return JSONResponse(content={'success': True, 'csrf_token': CACHED_CSRF_TOKEN}, status_code=status.HTTP_200_OK)
    
    SESSION = await user.get_session(PAYLOAD['email'], SESSION_ID, session)

    await cache.set(CSRF_TOKEN_KEY, SESSION.csrf_token, ttl=500)

    return JSONResponse(content={'success': True, 'csrf_token': SESSION.csrf_token}, status_code=status.HTTP_200_OK)