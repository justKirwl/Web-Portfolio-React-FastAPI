from random import randint

async def generate_email_code() -> int:
    code = randint(100000, 999999)

    return code