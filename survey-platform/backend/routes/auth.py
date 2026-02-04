from fastapi import APIRouter, status, Request, HTTPException
from fastapi.responses import JSONResponse

from asyncio import gather

from schemas.auth import RegisterSchema, LoginSchema, VerifyPasswordSchema
from database.database import sessionDep

from utils.auth import Auth
from utils.user import UserControl
from utils.cache import cache
from other.check_auth import check_auth_and_token

router = APIRouter()

auth = Auth()
user = UserControl()

@router.post('/register')
async def register_route(data: RegisterSchema, session: sessionDep):
    res = await auth.register(avatar=None, username=data.username, email=data.email, password=data.password, provider='email', session=session)

    if not res:
        return JSONResponse(content={'success': False, 'detail': 'User with this username or email already exists.'}, status_code=status.HTTP_409_CONFLICT)
    
    access_token, token_exp, uuid = res

    response = JSONResponse(content={'success': True, 'detail': 'Successfully signed up.'}, status_code=status.HTTP_201_CREATED)

    response.set_cookie('access_token', access_token, max_age=10800, secure=True, samesite='none', httponly=True)
    response.set_cookie('token_exp', token_exp, max_age=10800, secure=True, samesite='none', httponly=True)
    response.set_cookie('user_id', uuid, max_age=10800, secure=True, samesite='none', httponly=True)

    return response

@router.get('/check-auth/{token}')
async def check_auth(token: str, request: Request):
    if token != 'None':
        res = await auth.verify_token(token)

        if not res:
            return JSONResponse(content={'success': False}, status_code=status.HTTP_401_UNAUTHORIZED)
        
    elif not request.cookies.get('access_token') or not request.cookies.get('token_exp'):
        return JSONResponse(content={'success': False}, status_code=status.HTTP_401_UNAUTHORIZED)
    
    return JSONResponse(content={'success': True, 'isAuthorized': True, 'accessToken': request.cookies.get('access_token') if token == 'None' else token, 'userId': request.cookies.get('user_id')}, status_code=status.HTTP_200_OK)

@router.post('/login')
async def login(data: LoginSchema, session: sessionDep):
    res = await auth.login(data.emailOrUsername, data.loginPassword, 'email', data.twoFactor, session)

    if not res:
        return JSONResponse(content={'success': False, 'detail': 'Invalid email/username or password.'}, status_code=status.HTTP_403_FORBIDDEN)
    if isinstance(res, str):
        return JSONResponse(content={'success': True, 'detail': 'Email two factor required.'}, status_code=status.HTTP_422_UNPROCESSABLE_CONTENT)
    
    access_token, token_exp, uuid, language = res

    response = JSONResponse(content={'success': True, 'detail': 'Successfully signed in.', 'language': language}, status_code=status.HTTP_200_OK)

    response.set_cookie('access_token', access_token, max_age=10800, secure=True, samesite='none', httponly=True)
    response.set_cookie('token_exp', token_exp, max_age=10800, secure=True, samesite='none', httponly=True)
    response.set_cookie('user_id', uuid, max_age=10800, secure=True, samesite='none', httponly=True)

    return response


@router.get('/logout')
async def logout(request: Request):
    if not request.cookies.get('access_token') or not request.cookies.get('token_exp'):
        return JSONResponse(content={'success': False, 'detail': 'No credentials.'}, status_code=status.HTTP_404_NOT_FOUND)
    
    response = JSONResponse(content={'success': True, 'detail': 'Successfully logged out.'}, status_code=status.HTTP_200_OK)

    response.delete_cookie('access_token', secure=True, httponly=True, samesite='none')
    response.delete_cookie('token_exp', secure=True, httponly=True, samesite='none')
    response.delete_cookie('user_id', secure=True, httponly=True, samesite='none')

    user_id = request.cookies.get('user_id')

    keys_to_delete = [f'user-profile:{user_id}', f'user-avatar:{user_id}', f'user-dropdown:{user_id}']

    await gather(*[cache.delete(key) for key in keys_to_delete])

    return response

@router.post('/verify-password')
async def verify_password(data: VerifyPasswordSchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await user.verify_password(request.cookies.get('user_id'), data.initPassword, session)

    if not res:
        return JSONResponse(content={'success': True, 'detail': 'Please check password and try again.'}, status_code=status.HTTP_403_FORBIDDEN)
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)