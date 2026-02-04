from sqlalchemy import select, and_, inspect

from database.database import sessionDep
from database.models import Confirmation

from utils.quiz import QuizControl
from utils.survey import SurveyControl

quiz = QuizControl()
survey = SurveyControl()

class ConfirmationControl:

    async def get_confirmation_by_token(self, token: str, session: sessionDep) -> dict | bool:
        stmt_confirmation = select(Confirmation).where(Confirmation.token == token)
        res = await session.execute(stmt_confirmation)
        confirmation = res.scalar_one_or_none()

        if not confirmation:
            return False
        
        title = ''
        description = ''

        match confirmation.type:
            case 'quiz_accept':
                title = 'Request to retry a quiz.'
                description = 'Seems like someone wants to retry your quiz. Give him a chance?'
        
        return {'id': confirmation.id, 'type': confirmation.type, 'title': title, 'description': description,  'expiresAt': confirmation.expires_at, 'userId': confirmation.user_id, 'authorId': confirmation.author_id, 'status': confirmation.status}
    
    async def confirm(self, token: str, username: str, session: sessionDep) -> bool:
        stmt_confirmation = select(Confirmation).where(Confirmation.token == token)
        res = await session.execute(stmt_confirmation)
        confirmation = res.scalar_one_or_none()

        if not confirmation:
            return False
        
        match confirmation.type:
            case 'quiz_accept':
                quiz_response = await quiz.reset_response(confirmation.item_id, username, session)

                if not quiz_response:
                    return False
            case 'survey_accept':
                survey_response = await survey.reset_response(confirmation.item_id, username, session)

                if not survey_response:
                    return False
        
        confirmation.status = 'success'

        await session.commit()

        return True
    
    async def get_change_password_confirmation(self, token: str, session: sessionDep) -> dict:
        stmt_confirmation = select(Confirmation).where(and_(Confirmation.token == token, Confirmation.type == 'change_password'))
        res = await session.execute(stmt_confirmation)
        confirmation = res.scalar_one_or_none()

        if not confirmation:
            return False
        
        return {c.key: getattr(confirmation, c.key) for c in inspect(confirmation).mapper.column_attrs}