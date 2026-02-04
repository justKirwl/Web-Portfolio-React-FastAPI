from fastapi import WebSocket, APIRouter

from database.database import sessionDep

from utils.auth import Auth
from utils.notif import Notify

router = APIRouter()

auth = Auth()
notify = Notify()

@router.websocket('/check-auth/{access_token}')
async def check_auth(access_token: str, websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            ping = await websocket.receive_text()
            res = await auth.verify_token(access_token)
            
            if not res:
                await websocket.close(code=1000, reason='Token expired')

            await websocket.send_text('True')
    except Exception as e:
        print(e)

@router.websocket('/check-notifications/{user_id}')
async def check_notifications(user_id: str, websocket: WebSocket, session: sessionDep):
    await websocket.accept()
    try:
        while True:
            ping = await websocket.receive_text()
            res = await notify.check_user_notifications_length(user_id, session)

            await websocket.send_json({'notifLength': res})
    except Exception as e:
        print(e)