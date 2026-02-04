from fastapi import APIRouter, Request, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse

from asyncio import gather

from database.database import sessionDep

from utils.auth import Auth
from utils.user import UserControl
from utils.survey import SurveyControl
from utils.quiz import QuizControl
from utils.confirmation import ConfirmationControl
from utils.cache import cache
from utils.notif import Notify

from other.check_auth import check_auth_and_token

from schemas.user import ChangeDataSchema, ChangeEmailSchema, UpdatePasswordSchema, ChangePasswordRemotelySchema, UpdatePersonalInfoSchema, SwitchTrackActivitySchema, MarkNotificationSchema, PlanPaymentSchema, UpdateLanguageSchema

router = APIRouter()

auth = Auth()
user = UserControl()
survey = SurveyControl()
quiz = QuizControl()
confirmation = ConfirmationControl()
notify = Notify()

@router.get('/get-profile')
async def get_profile_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    cached_profile_exists = await cache.exists(f'user-profile:{user_id}')
    cached_achievements_exists = await cache.exists(f'user-achievements:{user_id}')
    cached_activity_exists = await cache.exists(f'user-activity:{user_id}')
    cached_settings_exists = await cache.exists(f'user-profile-settings:{user_id}')

    if cached_profile_exists and cached_achievements_exists and cached_activity_exists and cached_settings_exists:
        cached_profile = await cache.get(f'user-profile:{user_id}')
        cached_achievements = await cache.get(f'user-achievements:{user_id}')
        cached_activity = await cache.get(f'user-activity:{user_id}')
        cached_settings = await cache.get(f'user-profile-settings:{user_id}')

        cached_profile['profile']['achievements'] = cached_achievements

        return JSONResponse(content={'success': True, 'profile': cached_profile['profile'], 'settings': cached_settings, 'activity': cached_activity, 'surveys': len(cached_profile.get('surveys')), 'quizes': len(cached_profile.get('quizes')), 'responses': len(cached_profile.get('responses'))}, status_code=status.HTTP_200_OK)
        
    profile_data = await user.get_user(request.cookies.get('user_id'), session)
    activity_logs = await user.get_user_activity_log(user_id, session)
    settings_data = await user.get_user_settings_data(user_id, session)
    quizes = await quiz.get_user_quizes(request.cookies.get('user_id'), session)
    surveys = await survey.get_user_surveys(request.cookies.get('user_id'), session)
    responses = await user.get_user_responses(request.cookies.get('user_id'), session)

    if not profile_data and not activity_logs and not settings_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Something went wrong when have been trying to fetch profile.')
    
    await cache.set(f'user-profile:{user_id}', {'profile': profile_data, 'quizes': quizes, 'surveys': surveys, 'responses': responses}, ttl=600)
    await cache.set(f'user-achievements:{user_id}', profile_data.get('achievements'), ttl=600)
    await cache.set(f'user-activity:{user_id}', activity_logs, ttl=300)
    await cache.set(f'user-profile-settings:{user_id}', settings_data, ttl=300)
    
    return JSONResponse(content={'success': True, 'profile': profile_data, 'settings': settings_data, 'activity': activity_logs, 'surveys': len(surveys), 'quizes': len(quizes), 'responses': len(responses)}, status_code=status.HTTP_200_OK)

@router.put('/change-profile-avatar')
async def change_avatar_route(*, image: UploadFile = File(None), session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    keys_to_delete = [f'user-profile:{user_id}', f'user-avatar:{user_id}', f'user-dropdown:{user_id}']
        
    res = await user.change_avatar(user_id, image, session)

    if not res:
        return JSONResponse(content={'success': False, 'detail': 'Seems like file does not exists or it exceeding the limit - 5 MB'}, status_code=status.HTTP_403_FORBIDDEN)
    
    await gather(*[cache.delete(key) for key in keys_to_delete])
    
    return JSONResponse(content={'success': True, 'avatar': res}, status_code=status.HTTP_201_CREATED)

@router.get('/get-user-settings-data')
async def get_settings_data(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    res = await user.get_user(request.cookies.get('user_id'), session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    return JSONResponse(content={'success': True, 'user': res}, status_code=status.HTTP_200_OK)

@router.put('/change-data')
async def change_user_data(data: ChangeDataSchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    keys_to_delete = [f'user-profile:{user_id}', f'user-dropdown:{user_id}']
        
    res = await user.change_user_data(user_id, data.displayName, data.username, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    await gather(*[cache.delete(key) for key in keys_to_delete])
    
    username, displayName = res
    
    return JSONResponse(content={'success': True, 'username': username, 'displayName': displayName}, status_code=status.HTTP_200_OK)

@router.put('/change-user-email')
async def change_email_route(data: ChangeEmailSchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    keys_to_delete = [f'user-profile:{user_id}', f'user-dropdown:{user_id}']
        
    email = await user.change_email(user_id, data.email, session)

    if not email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    await gather(*[cache.delete(key) for key in keys_to_delete])

    return JSONResponse(content={'success': True, 'email': email}, status_code=status.HTTP_200_OK)

@router.put('/update-password')
async def update_password_route(data: UpdatePasswordSchema, session: sessionDep, request: Request):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    res = await user.update_password(request.cookies.get('user_id'), data.current, data.new, session)

    if not res:
        return JSONResponse(content={'success': False}, status_code=status.HTTP_403_FORBIDDEN)
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.get('/connect-email-verification')
async def connect_email_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
        
    user_data = await user.get_user(request.cookies.get('user_id'), session)

    if not user_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    res = await user.set_email_verification(user_data.get('uuid'), session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.delete('/delete-user-account')
async def delete_account_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    keys_to_delete = [f'user-profile:{user_id}', f'user-avatar:{user_id}', f'user-dropdown:{user_id}', f'user-achievements:{user_id}', f'user-activity:{user_id}', f'user-profile-settings:{user_id}']
    
    res = await user.delete_account(user_id, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    await gather(*[cache.delete(key) for key in keys_to_delete])
    
    response = JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

    response.delete_cookie('access_token', secure=True, httponly=True, samesite='none')
    response.delete_cookie('token_exp', secure=True, httponly=True, samesite='none')
    response.delete_cookie('user_id', secure=True, httponly=True, samesite='none')

    return response

@router.put('/change-account-password-remotely')
async def change_password_remotely_route(data: ChangePasswordRemotelySchema, session: sessionDep):
    res = await confirmation.get_change_password_confirmation(data.token, session)

    is_password_changed = await user.change_password_remotely(res.get('user_id'), data.newPassword, session)

    if not is_password_changed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.get('/get-user-avatar')
async def get_user_avatar_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    cached_avatar_exists = await cache.exists(f'user-avatar:{user_id}')

    if cached_avatar_exists:
        cached_avatar = await cache.get(f'user-avatar:{user_id}')
        return JSONResponse(content={'success': True, 'avatarUrl': cached_avatar}, status_code=status.HTTP_200_OK)
    
    avatar = await user.get_avatar(user_id, session)

    if not avatar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    await cache.set(f'user-avatar:{user_id}', avatar, ttl=300)

    return JSONResponse(content={'success': True, 'avatarUrl': avatar}, status_code=status.HTTP_200_OK)

@router.get('/reset-two-factor')
async def reset_two_factor_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    reset_response = await user.reset_two_factor_verification(user_id, session)

    if not reset_response:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')

    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.put('/update-personal-info')
async def update_personal_info(data: UpdatePersonalInfoSchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    initialData = await user.update_personal_info(user_id, data.__pydantic_extra__, session)

    if not initialData:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    await cache.delete(f'user-profile:{user_id}')
    
    return JSONResponse(content={'success': True, 'initialData': initialData}, status_code=status.HTTP_200_OK)

@router.put('/switch-track-activity')
async def switch_track_activity(data: SwitchTrackActivitySchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    res = await user.switch_track_activity(user_id, data.track, session)

    if isinstance(res, str):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    return JSONResponse(content={'success': True, 'track': res}, status_code=status.HTTP_200_OK)

@router.get('/get-user-notifications')
async def get_notifications_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    cached_notif_exists = await cache.exists(f'user-notif:{user_id}')

    if cached_notif_exists:
        cached_notif = await cache.get(f'user-notif:{user_id}')

        return JSONResponse(content={'success': True, 'notifications': cached_notif}, status_code=status.HTTP_200_OK)
    
    res = await notify.get_user_notifications(user_id, session)

    await cache.set(f'user-notif:{user_id}', res, ttl=35)

    return JSONResponse(content={'success': True, 'notifications': res}, status_code=status.HTTP_200_OK)

@router.put('/mark-notification-read')
async def mark_notification_route(data: MarkNotificationSchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    res = await notify.mark_notification_as_read(user_id, data.notifId, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Notification have not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.get('/mark-all-notifications-read')
async def mark_all_notifications_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')

    res = await notify.mark_all_notifications_as_read(user_id, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Notifications have not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.delete('/delete-notification/{notif_id}')
async def delete_notification_route(notif_id: int, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    res = await notify.delete_notification(user_id, notif_id, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Notifications have not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)

@router.post('/upgrade-payment-submit')
async def upgrade_payment_submit(data: PlanPaymentSchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    res = await user.upgrade_user_plan(user_id, data.planId, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_201_CREATED)

@router.get('/get-user-plan')
async def get_user_plan_route(request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    plan = await user.get_user_plan(user_id, session)

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')
    
    return JSONResponse(content={'success': True, 'plan': plan}, status_code=status.HTTP_200_OK)

@router.put('/change-profile-banner')
async def upload_banner_route(*, image: UploadFile = File(default=None), request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    res = await user.upload_banner(user_id, image, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User has not been found.')

    return JSONResponse(content={'success': True, 'banner': res}, status_code=status.HTTP_200_OK)

@router.put('/update-user-language')
async def update_language(data: UpdateLanguageSchema, request: Request, session: sessionDep):
    res = await check_auth_and_token(request.cookies)

    if isinstance(res, tuple):
        raise HTTPException(status_code=res[0], detail=res[1])
    
    user_id = request.cookies.get('user_id')
    
    res = await user.update_user_language(user_id, data.language, session)

    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User or language code has not been found.')
    
    return JSONResponse(content={'success': True}, status_code=status.HTTP_200_OK)