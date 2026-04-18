from fastapi import Request, HTTPException, status, Depends

from time import time
from uuid import uuid4

from typing import Annotated

from utils.cache import redis_limiter
from utils.user import UserControl
from other.check_for_credentials import check_for_credentials

user = UserControl()

class RateLimiter:

    @staticmethod
    async def is_limited(email: str, endpoint: str, max_requests: int, window_seconds: int) -> bool:
        key = f'rate_limiter_{endpoint}:{email}'

        current_ms = time() * 1000
        window_start_ms = current_ms - window_seconds * 1000

        current_request = f'{current_ms}-{uuid4().hex[:6]}'

        async with redis_limiter.pipeline(transaction=True) as pipe:
            await pipe.zremrangebyscore(key, 0, window_start_ms)

            await pipe.zadd(key, {current_request: current_ms})

            await pipe.zcard(key)

            await pipe.expire(key, window_seconds + 5)

            EXECUTED = await pipe.execute()

        _, _, current_count, _ = EXECUTED

        return current_count >= max_requests
    
def get_rate_limiter():
    return RateLimiter()

def rate_limiter_factory(endpoint: str, max_requests: int, window_seconds: int):

    async def dependency(request: Request, rate_limiter: Annotated[RateLimiter, Depends(get_rate_limiter)]):
        if not (PAYLOAD := await check_for_credentials(request.cookies)):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        
        limited = await rate_limiter.is_limited(PAYLOAD['email'], endpoint, max_requests, window_seconds)

        if limited:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS)
        
    return dependency

support_chat_rate_limiter = rate_limiter_factory('send_support_message', max_requests=3, window_seconds=10)
update_chat_favorite_rate_limiter = rate_limiter_factory('update_chat_favorite', max_requests=4, window_seconds=10)
update_chat_title_rate_limiter = rate_limiter_factory('update_chat_title', max_requests=3, window_seconds=15)
update_settings_data_rate_limiter = rate_limiter_factory('update_settings_data', max_requests=3, window_seconds=10)
update_theme_rate_limiter = rate_limiter_factory('update_theme', max_requests=4, window_seconds=15)