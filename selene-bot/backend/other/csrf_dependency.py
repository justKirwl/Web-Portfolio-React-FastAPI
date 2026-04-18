from fastapi import Request, HTTPException, status, BackgroundTasks

from datetime import datetime, timezone, timedelta
import secrets

from database.database import SessionDep

from utils.user import UserControl

from other.check_for_credentials import check_for_credentials

user = UserControl()

async def check_csrf_token(request: Request, session: SessionDep, background_tasks: BackgroundTasks):
    if request.method in ['POST', 'PUT', 'DELETE']:
        if not (PAYLOAD := await check_for_credentials(request.cookies)):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        
        COOKIE_CSRF_TOKEN, HEADER_CSRF_TOKEN, SESSION_ID = request.cookies.get('csrf_token'), request.headers.get('x-csrftoken'), request.cookies.get('session_id')

        if not COOKIE_CSRF_TOKEN or not HEADER_CSRF_TOKEN or not SESSION_ID:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        
        CURRENT_SESSION = await user.get_session(PAYLOAD['email'], SESSION_ID, session)

        if not secrets.compare_digest(COOKIE_CSRF_TOKEN, HEADER_CSRF_TOKEN) or not secrets.compare_digest(HEADER_CSRF_TOKEN, CURRENT_SESSION.csrf_token):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
        
        if datetime.now(timezone.utc).timestamp() > (datetime.fromtimestamp(CURRENT_SESSION.csrf_updated_at, tz=timezone.utc) + timedelta(hours=1)).timestamp():
            NEW_CSRF_TOKEN = secrets.token_urlsafe(32)

            background_tasks.add_task(user.update_csrf_token, NEW_CSRF_TOKEN, PAYLOAD['email'], SESSION_ID, session)

            return NEW_CSRF_TOKEN, True
        
        return HEADER_CSRF_TOKEN, False