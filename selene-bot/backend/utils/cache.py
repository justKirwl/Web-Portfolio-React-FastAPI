from aiocache import RedisCache
from aiocache.serializers import JsonSerializer

from redis.asyncio import Redis
from redis.exceptions import TimeoutError, ConnectionError

from redis.retry import Retry
from redis.backoff import ExponentialBackoff

from dotenv import load_dotenv
from os import getenv

load_dotenv()

REDIS_URL = getenv('REDIS_URL')

cache = RedisCache(serializer=JsonSerializer(), endpoint='redis_container', port=6379, timeout=10) if not REDIS_URL else RedisCache(serializer=JsonSerializer(), endpoint="cheerful-crawdad-98327.upstash.io", port=6379, password="gQAAAAAAAYAXAAIncDI5ZTkxOWE1MDlmMWQ0MDFhODdiOTAyZTEzNjBiODgxZXAyOTgzMjc", ssl=True, timeout=10)

redis_limiter = Redis(host="redis_container", port=6379, max_connections=10, retry_on_error=[TimeoutError, ConnectionError, ConnectionResetError], retry=Retry(ExponentialBackoff(cap=10, base=1), retries=10)) if not REDIS_URL else Redis.from_url(REDIS_URL)