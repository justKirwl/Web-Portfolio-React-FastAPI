from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse

from other.oauth_settings import oauth
from database.database import sessionDep
from utils.auth import Auth

router = APIRouter()

auth = Auth()

@router.get('/auth/{provider}')
async def auth_provider(request: Request, provider: str):
    redirect_uri = request.url_for(f'auth_{'google' if provider == 'google' else 'github'}')

    return await oauth.google.authorize_redirect(request, redirect_uri, prompt='consent') if provider == 'google' else await oauth.github.authorize_redirect(request, redirect_uri, prompt='consent')
    
@router.get('/auth/google/callback', name='auth_google')
async def auth_google(request: Request, session: sessionDep):
    token = await oauth.google.authorize_access_token(request)

    user = token['userinfo']

    res_signup = await auth.register(avatar=user['picture'], username=user['name'], email=user['email'], password='', provider='google', session=session)

    if not res_signup:
        res_login = await auth.login(user['email'], '', 'google', False, session)

        if not res_login:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Something went wrong...')
        
    
    response = RedirectResponse(url='http://localhost:5173')

    access_token, token_exp, uuid = res_signup if res_signup else res_login

    response.set_cookie('access_token', access_token, max_age=10800, secure=True, samesite='none', httponly=True)
    response.set_cookie('token_exp', token_exp, max_age=10800, secure=True, samesite='none', httponly=True)
    response.set_cookie('user_id', uuid, max_age=10800, secure=True, samesite='none', httponly=True)

    return response

@router.get('/auth/github/callback', name='auth_github')
async def auth_github(request: Request, session: sessionDep):
    token = await oauth.github.authorize_access_token(request)

    res = await auth.authorize_via_github(token, session)
    
    response = RedirectResponse(url='http://localhost:5173')

    access_token, token_exp, uuid = res

    response.set_cookie('access_token', access_token, max_age=10800, secure=True, samesite='none', httponly=True)
    response.set_cookie('token_exp', token_exp, max_age=10800, secure=True, samesite='none', httponly=True)
    response.set_cookie('user_id', uuid, max_age=10800, secure=True, samesite='none', httponly=True)

    return response