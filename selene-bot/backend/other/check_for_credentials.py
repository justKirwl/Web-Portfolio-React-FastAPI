from typing import Any

from utils.auth import Auth

auth = Auth()

async def check_for_credentials(credentials: dict[str, Any], both_required: bool = False) -> bool | dict[str, Any]:
    ACCESS_TOKEN, REFRESH_TOKEN = credentials.get('access_token'), credentials.get('refresh_token')

    if (not both_required and not any([ACCESS_TOKEN, REFRESH_TOKEN])) or (both_required and not all([ACCESS_TOKEN, REFRESH_TOKEN])):
        return False
    
    PAYLOAD = await auth.verify_access_token(ACCESS_TOKEN)

    return PAYLOAD or False