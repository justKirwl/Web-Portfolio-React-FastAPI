from utils.auth import Auth

auth = Auth()

async def check_auth_and_token(cookies: dict[str, str]) -> tuple[int, str] | bool:
    if not cookies.get('access_token') or not cookies.get('token_exp'):
        return 401, 'No credentials.'
    else:
        res = await auth.verify_token(cookies.get('access_token'))

        if not res:
            return 403, 'Authorize please.'
        
    return True