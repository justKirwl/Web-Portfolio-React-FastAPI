from fastapi import APIRouter, status, Form
from fastapi.responses import StreamingResponse, JSONResponse

from dotenv import load_dotenv
from os import getenv

from utils.model import stream_generate, generate_instant_response

load_dotenv()

IS_MOCK = getenv('MOCK')

router = APIRouter()

@router.post('/generate-stream')
async def generate_stream_route(prompt: str = Form(None)):
    return StreamingResponse(stream_generate(prompt), status_code=status.HTTP_201_CREATED, media_type='text/event-stream')

@router.post('/generate-response')
async def generate_instant_route(prompt: str = Form(None)):
    data = generate_instant_response(prompt)

    return JSONResponse(content={'success': True, 'response': data}, status_code=status.HTTP_201_CREATED)