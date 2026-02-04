import pytest
from json import dumps

@pytest.mark.asyncio
async def test_create_quiz(client_session, test_user, test_token, quiz_create_auto_clear):
    title = quiz_create_auto_clear
    res = await client_session.post('/create-quiz', json={'title': title, 'description': 'Test', 'timeLimit': 30, 'passingScore': 100, 'showResults': False, 'shuffleQuestions': False, 'questions': []}, cookies={**test_token, 'user_id': test_user.uuid})

    data = await res.json()

    assert res.status == 201
    print(dumps(data.get('quiz'), indent=4))