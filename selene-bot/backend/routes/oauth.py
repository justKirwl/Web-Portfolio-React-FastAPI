from fastapi import APIRouter, Request, Response, status
from fastapi.responses import RedirectResponse

from dotenv import load_dotenv
from os import getenv

from utils.oauth import oauth
from utils.auth import Auth
from utils.user import UserControl

from database.database import SessionDep

load_dotenv()

FRONTEND_HOST = getenv('FRONTEND_HOST')

router = APIRouter()

auth = Auth()

user = UserControl()

@router.get('/auth/{provider}')
async def auth_google(request: Request, provider: str):
    if request.cookies.get('access_token') or request.cookies.get('refresh_token'):
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    
    REDIRECT_URI = request.url_for('auth_google_callback' if provider == 'google' else 'auth_github_callback')
    
    return await oauth.google.authorize_redirect(request, REDIRECT_URI, prompt='consent') if provider == 'google' else await oauth.github.authorize_redirect(request, REDIRECT_URI, prompt='consent')

@router.get('/auth/google/callback', name='auth_google_callback')
async def auth_google_callback(request: Request, session: SessionDep):
    if request.cookies.get('access_token') or request.cookies.get('refresh_token'):
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    
    token = await oauth.google.authorize_access_token(request)

    user_data = token['userinfo']

    SIGNIN_RES = await auth.google_authorization({'username': user_data['name'], 'email': user_data['email']}, session)
    
    ACCESS_TOKEN, REFRESH_TOKEN = SIGNIN_RES

    SESSION_ID, CSRF_TOKEN = await user.create_session(user_data['email'], session)

    response = RedirectResponse(url=f'http://localhost:5173' if not FRONTEND_HOST else FRONTEND_HOST)

    response.set_cookie('access_token', ACCESS_TOKEN, max_age=900, secure=True, samesite='none', httponly=True)
    response.set_cookie('refresh_token', REFRESH_TOKEN, max_age=604800, secure=True, samesite='none', httponly=True)
    response.set_cookie('csrf_token', CSRF_TOKEN, max_age=604800, secure=True, samesite='none')
    response.set_cookie('session_id', SESSION_ID, max_age=604800, secure=True, httponly=True, samesite='none')

    return response

@router.get('/auth/github/callback', name='auth_github_callback')
async def auth_github_callback(request: Request, session: SessionDep):
    if request.cookies.get('access_token') or request.cookies.get('refresh_token'):
        return Response(status_code=status.HTTP_403_FORBIDDEN)

    token = await oauth.github.authorize_access_token(request)

    SIGNIN_RES = await auth.github_authorization(token, session)

    SESSION_ID, CSRF_TOKEN, ACCESS_TOKEN, REFRESH_TOKEN = SIGNIN_RES

    response = RedirectResponse(url=f'http://localhost:5173' if not FRONTEND_HOST else FRONTEND_HOST)

    response.set_cookie('access_token', ACCESS_TOKEN, max_age=900, secure=True, samesite='none', httponly=True)
    response.set_cookie('refresh_token', REFRESH_TOKEN, max_age=604800, secure=True, samesite='none', httponly=True)
    response.set_cookie('csrf_token', CSRF_TOKEN, max_age=604800, secure=True, samesite='none')
    response.set_cookie('session_id', SESSION_ID, max_age=604800, secure=True, httponly=True, samesite='none')

    return response