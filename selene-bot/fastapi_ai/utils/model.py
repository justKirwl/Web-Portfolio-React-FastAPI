from ctransformers import AutoModelForCausalLM
from tokenizers import Tokenizer

from dotenv import load_dotenv
from os import getenv

from asyncio import sleep

from typing import AsyncGenerator

load_dotenv()

IS_MOCK = getenv('MOCK')

model = AutoModelForCausalLM.from_pretrained(
    "itlwas/Mistral-7B-Instruct-v0.1-Q4_K_M-GGUF",
    model_file="mistral-7b-instruct-v0.1-q4_k_m.gguf"
) if IS_MOCK != '1' else None

tokenizer = Tokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.1") if IS_MOCK != '1' else None

async def stream_generate(prompt: str) -> AsyncGenerator[str, None]:
    for token in model._stream(prompt, max_new_tokens=512, temperature=0.5) if IS_MOCK != '1' else 'This is test response from me. I am Selene bot and ready to serve you as your assistant, its pleasure to meet you!'.split():
        yield f'data: {token + " " if IS_MOCK == '1' else token}\n\n'
        if (IS_MOCK == '1'):
            await sleep(0.3)

def generate_instant_response(prompt: str) -> str:
    buffer = ''

    for token in model._stream(prompt, max_new_tokens=512, temperature=0.5) if IS_MOCK != '1' else 'This is test response from me. I am Selene bot and ready to serve you as your assistant, its pleasure to meet you!'.split():
        buffer += token

    return buffer