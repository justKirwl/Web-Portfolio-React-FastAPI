from fastapi import APIRouter, Request, Response, status, BackgroundTasks, Form, Depends
from fastapi.responses import JSONResponse

from json import dumps, loads

from asyncio import gather

from yagmail import SMTP

from os import getenv
from dotenv import load_dotenv

from database.database import SessionDep

from utils.auth import Auth
from utils.user import UserControl
from utils.cache import cache
from utils.chat import ChatControl
from utils.rate_limiter import support_chat_rate_limiter, update_chat_favorite_rate_limiter, update_chat_title_rate_limiter, update_settings_data_rate_limiter, update_theme_rate_limiter

from other.check_for_credentials import check_for_credentials
from other.html_templates import get_feedback_html
from other.csrf_dependency import check_csrf_token

from schemas.chat import UpdateFavoriteFlagSchema, UpdateChatTitleSchema, UpgradePlanSchema, SendSupportMessageSchema, UpdateDataSchema, UpdateMessageSchema

router = APIRouter()

auth = Auth()
user = UserControl()
chat = ChatControl()

load_dotenv()

EMAIL = getenv('EMAIL')
EMAIL_APP_PASSWORD = getenv('EMAIL_APP_PASSWORD')

yag = SMTP(user=EMAIL, password=EMAIL_APP_PASSWORD)

@router.get('/me')
async def get_user_route(request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    CACHED_DATA_EXISTS = await cache.exists(f'user-data:{PAYLOAD['email']}')

    if CACHED_DATA_EXISTS:
        CACHED_DATA = await cache.get(f'user-data:{PAYLOAD['email']}')

        return JSONResponse(content={'success': True, 'userData': CACHED_DATA}, status_code=status.HTTP_200_OK)
    
    IS_USER_EXISTS = await auth.check_user_for_exist(PAYLOAD['email'], session)

    if not IS_USER_EXISTS:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    
    USERDATA = await user.get_user_data_by_email(PAYLOAD['email'], session)

    await cache.set(f'user-data:{PAYLOAD['email']}', USERDATA, ttl=1800)

    return JSONResponse(content={'success': True, 'userData': USERDATA}, status_code=status.HTTP_200_OK)

@router.get('/chats')
async def get_user_chats_route(request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    CACHED_CHATS_EXISTS = await cache.exists(f'user-chats:{PAYLOAD['email']}')

    if CACHED_CHATS_EXISTS:
        CACHED_CHATS = await cache.get(f'user-chats:{PAYLOAD['email']}')

        return JSONResponse(content={'success': True, 'chats': loads(CACHED_CHATS) if isinstance(CACHED_CHATS, str) else CACHED_CHATS}, status_code=status.HTTP_200_OK)
    
    CHATS = await chat.get_user_chats(PAYLOAD['email'], session)

    if CHATS:
        await cache.set(f'user-chats:{PAYLOAD['email']}', dumps(CHATS), ttl=100)

    return JSONResponse(content={'success': True, 'chats': CHATS}, status_code=status.HTTP_200_OK)

@router.get('/get-chat-messages/{chat_id}')
async def get_chat_messages_route(chat_id: str, request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    MESSAGES = await chat.get_chat_messages(PAYLOAD['email'], chat_id, session)

    if isinstance(MESSAGES, bool):
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    
    return JSONResponse(content={'success': True, 'messages': MESSAGES}, status_code=status.HTTP_200_OK)

@router.delete('/delete-chat/{chat_id}')
async def delete_chat_route(chat_id: str, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    IS_CHAT_DELETED = await chat.delete_chat(chat_id, PAYLOAD['email'], session)

    if not IS_CHAT_DELETED:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    
    response = Response(status_code=status.HTTP_200_OK)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.put('/update-chat-favorite', dependencies=[Depends(update_chat_favorite_rate_limiter)])
async def update_favorite_flag_route(data: UpdateFavoriteFlagSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    UPDATE_FLAG_RES = await chat.set_favorite_flag(data.chatId, PAYLOAD['email'], session)

    response = Response(status_code=status.HTTP_200_OK if UPDATE_FLAG_RES else status.HTTP_404_NOT_FOUND)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.put('/update-chat-title', dependencies=[Depends(update_chat_title_rate_limiter)])
async def update_chat_title_route(data: UpdateChatTitleSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    UPDATE_TITLE_RES = await chat.update_chat_title(data.chatId, PAYLOAD['email'], data.newTitle, session)

    response = Response(status_code=status.HTTP_200_OK if UPDATE_TITLE_RES else status.HTTP_404_NOT_FOUND)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.get('/get-chat/{chat_id}')
async def get_chat_route(chat_id: str, request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    CHAT = await chat.get_chat(chat_id, PAYLOAD['email'], session)

    if not CHAT:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    
    return JSONResponse(content={'success': True, 'chat': CHAT}, status_code=status.HTTP_200_OK)

@router.put('/upgrade-plan')
async def upgrade_plan_route(data: UpgradePlanSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    await user.upgrade_plan(PAYLOAD['email'], data.plan, session)

    response = Response(status_code=status.HTTP_200_OK)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.post('/send-support-message', dependencies=[Depends(support_chat_rate_limiter)])
async def send_support_message_route(data: SendSupportMessageSchema, request: Request, background_tasks: BackgroundTasks, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    background_tasks.add_task(yag.send, EMAIL, subject='Feedback from user.', contents=get_feedback_html(PAYLOAD['email'], data.message))

    response = Response(status_code=status.HTTP_201_CREATED)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.get('/get-settings-data')
async def get_settings_data_route(request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    SETTINGS_DATA_EXISTS = await cache.exists(f'settings-data:{PAYLOAD['email']}')

    if SETTINGS_DATA_EXISTS:
        SETTINGS_DATA_UNTYPED = await cache.get(f'settings-data:{PAYLOAD['email']}')

        SETTINGS_DATA_LOADED = SETTINGS_DATA_UNTYPED if isinstance(SETTINGS_DATA_UNTYPED, dict) else loads(SETTINGS_DATA_UNTYPED)

        return JSONResponse(content={'success': True, 'settingsData': SETTINGS_DATA_LOADED}, status_code=status.HTTP_200_OK)

    SETTINGS_DATA = await user.get_user_settings_data(PAYLOAD['email'], session)

    await cache.set(f'settings-data:{PAYLOAD['email']}', dumps(SETTINGS_DATA), ttl=1000)

    return JSONResponse(content={'success': True, 'settingsData': SETTINGS_DATA}, status_code=status.HTTP_200_OK)

@router.put('/update-user-data', dependencies=[Depends(update_settings_data_rate_limiter)])
async def update_user_data_route(data: UpdateDataSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    await user.update_user_data(data.model_dump(), PAYLOAD['email'], session)

    response = Response(status_code=status.HTTP_200_OK)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.put('/update-theme', dependencies=[Depends(update_theme_rate_limiter)])
async def update_theme_route(*, theme: str = Form(None), request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if not theme:
        return Response(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT)
    
    await user.update_theme(theme, PAYLOAD['email'], session)

    response = Response(status_code=status.HTTP_200_OK)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.put('/update-user-message')
async def update_message_route(data: UpdateMessageSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    PAYLOAD = await auth.verify_access_token(request.cookies.get('access_token'))

    if not PAYLOAD:
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    UPDATE_RES = await chat.update_message(data.newContent, PAYLOAD['email'], data.messageId, session)

    if not UPDATE_RES:
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    
    response = Response(status_code=status.HTTP_200_OK)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.put('/update-language')
async def update_language_route(*, language: str = Form('en'), request: Request, session: SessionDep, backgroundTasks: BackgroundTasks, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    backgroundTasks.add_task(user.update_language, language, PAYLOAD['email'], session)

    response = Response(status_code=status.HTTP_200_OK)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.delete('/delete-account', dependencies=[Depends(check_csrf_token)])
async def delete_account_route(request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    await user.delete_account(PAYLOAD['email'], session)

    response = Response(status_code=status.HTTP_200_OK)

    response.delete_cookie('access_token', secure=True, httponly=True, samesite='lax')
    response.delete_cookie('refresh_token', secure=True, httponly=True, samesite='lax')
    response.delete_cookie('csrf_token', secure=True, samesite='lax')
    response.delete_cookie('session_id', secure=True, httponly=True, samesite='lax')

    await gather(*[f'user-chats:{PAYLOAD['email']}', f'settings-data:{PAYLOAD['email']}', f'user-data:{PAYLOAD['email']}'])

    return response