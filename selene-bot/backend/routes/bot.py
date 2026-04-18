from fastapi import APIRouter, Request, Response, status, Depends
from fastapi.responses import StreamingResponse, JSONResponse

import aiohttp

from dotenv import load_dotenv
from os import getenv

from uuid import uuid4
from json import dumps

from typing import AsyncGenerator

from schemas.bot import GenerateBotContentSchema, NewChatSchema, SaveBotMessageSchema, DeleteMessageSchema, ResaveBotMessageSchema

from utils.cache import cache
from utils.chat import ChatControl
from utils.auth import Auth
from utils.user import UserControl

from database.database import SessionDep

from other.check_for_credentials import check_for_credentials
from other.json_to_prompt import json_to_prompt
from other.csrf_dependency import check_csrf_token

router = APIRouter()

load_dotenv()

AI_SERVER_HOST = getenv('AI_SERVER_HOST')
IS_MOCK = getenv('MOCK')

chat = ChatControl()
auth = Auth()

user = UserControl()

async def get_stream_response(prompt: str) -> AsyncGenerator[str, None]:
    async with aiohttp.ClientSession() as client:
        async with client.post(f'{AI_SERVER_HOST}/generate-stream', data={'prompt': prompt}) as response:
            async for chunk in response.content.iter_any():
                token = chunk.decode('utf-8')
                yield token

async def get_instant_response(prompt: str) -> str:
    async with aiohttp.ClientSession() as client:
        async with client.post(f'{AI_SERVER_HOST}/generate-response', data={'prompt': prompt}) as response:
            if response.status != 201:
                text = await response.text()
                raise RuntimeError(f"Bad status {response.status}: {text}")
            
            result = await response.json()
            return result.get("response", "")

@router.post('/set-prompt-id')
async def set_prompt_id(data: GenerateBotContentSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies, True)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    PROMPT_ID = str(uuid4())

    CHAT_MESSAGES = await chat.get_bot_memory_messages(PAYLOAD['email'], data.chatId, session, limit=5)

    if isinstance(CHAT_MESSAGES, bool):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if data.createUserMessage:
        CHAT_MESSAGES.append({'isUser': True, 'content': data.prompt})

        CHAT_MESSAGES_FORMATTED = json_to_prompt(dumps(CHAT_MESSAGES))

        ALL_CHAT_MESSAGES = await chat.get_bot_memory_messages(PAYLOAD['email'], data.chatId, session, limit=None)

        ALL_CHAT_MESSAGES_FORMATTED = json_to_prompt(dumps(ALL_CHAT_MESSAGES))

        USER_DATA = await user.get_user_data_by_email(PAYLOAD['email'], session)

        if IS_MOCK != '1':
            from ...fastapi_ai.utils.model import tokenizer

            USED_SESSION = round((len(tokenizer.encode(ALL_CHAT_MESSAGES_FORMATTED)) / USER_DATA.get('plan')[1]) * 100)
        else:
            USED_SESSION = round((len(ALL_CHAT_MESSAGES_FORMATTED.split()) / USER_DATA.get('plan')[1]) * 100)

        if USED_SESSION >= 100:
            return Response(status_code=status.HTTP_403_FORBIDDEN)
        
        USER_MESSAGE = await chat.create_user_message(data.model_dump(), PAYLOAD['email'], session)

        if not USER_MESSAGE:
            return Response(status_code=status.HTTP_401_UNAUTHORIZED)

        await cache.set(f'user-prompt-id:{PROMPT_ID}', CHAT_MESSAGES_FORMATTED, ttl=100)
    else:
        await chat.set_is_new_chat(data.chatId, False, session)

        await cache.set(f'user-prompt-id:{PROMPT_ID}', data.prompt, ttl=100)

    response = JSONResponse(content={'success': True, 'id': PROMPT_ID}, status_code=status.HTTP_201_CREATED)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')
    
    return response

@router.get('/generate-chat-title/{prompt_id}')
async def generate_chat_title_route(prompt_id: str, request: Request):
    if not await check_for_credentials(request.cookies, True):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if not await cache.exists(f'user-prompt-id:{prompt_id}'):
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    
    PROMPT = await cache.get(f'user-prompt-id:{prompt_id}')

    FINAL_TITLE = await get_instant_response(f'Summarize this text in 3-5 words as a concise title:\n\n{PROMPT}')

    return JSONResponse(content={'success': True, 'finalTitle': FINAL_TITLE}, status_code=status.HTTP_200_OK)

@router.get('/regenerate-content/{msg_ts}/{chat_id}')
async def regenerate_content_route(msg_ts: int, chat_id: str, request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies, True)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    PROMPT = await chat.get_first_messages_by_timestamp(msg_ts, PAYLOAD['email'], chat_id, session)

    PROMPT_MESSAGES_FORMATTED = json_to_prompt(dumps(PROMPT))

    return StreamingResponse(get_stream_response(PROMPT_MESSAGES_FORMATTED), status_code=status.HTTP_200_OK, media_type='text/event-stream')

@router.get('/generate-bot-content/{prompt_id}')
async def generate_content_route(prompt_id: str, request: Request):
    if not await check_for_credentials(request.cookies, True):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    if not await cache.exists(f'user-prompt-id:{prompt_id}'):
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    
    PROMPT = await cache.get(f'user-prompt-id:{prompt_id}')

    return StreamingResponse(get_stream_response(PROMPT), status_code=status.HTTP_200_OK, media_type='text/event-stream')

@router.post('/new-chat')
async def new_chat_route(data: NewChatSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies, True)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    CHAT_ID = await chat.new_chat(data.model_dump(), PAYLOAD['email'], session)

    response = JSONResponse(content={'success': True, 'chatId': CHAT_ID}, status_code=status.HTTP_201_CREATED)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.post('/save-bot-message/{chat_id}')
async def save_bot_message_route(chat_id: str, data: SaveBotMessageSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies, True)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    await chat.save_bot_message(data.model_dump(), PAYLOAD['email'], chat_id, session)

    CHAT_MESSAGES = await chat.get_bot_memory_messages(PAYLOAD['email'], chat_id, session, limit=None)

    CHAT_MESSAGES_FORMATTED = json_to_prompt(dumps(CHAT_MESSAGES))

    USER_DATA = await user.get_user_data_by_email(PAYLOAD['email'], session)

    if IS_MOCK != '1':
        from ...fastapi_ai.utils.model import tokenizer

        USED_SESSION = round((len(tokenizer.encode(CHAT_MESSAGES_FORMATTED)) / USER_DATA.get('plan')[1]) * 100)        
    else:
        USED_SESSION = round((len(CHAT_MESSAGES_FORMATTED.split()) / USER_DATA.get('plan')[1]) * 100)

    response = JSONResponse(content={'success': True, 'usedSession': USED_SESSION}, status_code=status.HTTP_201_CREATED)

    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')

    return response

@router.post('/resave-bot-message')
async def resave_bot_message(data: ResaveBotMessageSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies, True)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    SAVE_RESPONSE = await chat.resave_bot_message_content(data.content, data.chatId, data.thinkingTime, PAYLOAD['email'], data.messageId, session)

    if not SAVE_RESPONSE:
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    
    response = Response(status_code=status.HTTP_201_CREATED)
    
    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')
    
    return response

@router.get('/check-new-chat/{chat_id}')
async def check_new_chat_route(chat_id: str, request: Request, session: SessionDep):
    if not (PAYLOAD := await check_for_credentials(request.cookies, True)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    NEW_CHAT_RESPONSE = await chat.check_new_chat(chat_id, PAYLOAD['email'], session)

    return JSONResponse(content={'success': True, 'isNew': NEW_CHAT_RESPONSE}, status_code=status.HTTP_200_OK)

@router.post('/delete-message')
async def delete_message_route(data: DeleteMessageSchema, request: Request, session: SessionDep, csrf_tuple: tuple[str, bool] = Depends(check_csrf_token)):
    if not (PAYLOAD := await check_for_credentials(request.cookies, True)):
        return Response(status_code=status.HTTP_401_UNAUTHORIZED)
    
    DELETE_RESPONSE = await chat.delete_message(PAYLOAD['email'], data.messageId, data.chatId, session)

    if not DELETE_RESPONSE:
        return Response(status_code=status.HTTP_403_FORBIDDEN)
    
    response = Response(status_code=status.HTTP_200_OK)
    
    if csrf_tuple[1]:
        response.set_cookie('csrf_token', csrf_tuple[0], max_age=604800, secure=True, samesite='lax')
    
    return response