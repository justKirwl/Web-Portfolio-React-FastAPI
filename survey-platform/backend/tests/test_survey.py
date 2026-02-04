import pytest
from json import dumps

@pytest.mark.asyncio
async def test_create_survey(client_session, test_user, test_token, create_survey_auto_cleanup):
    title = create_survey_auto_cleanup
    res = await client_session.post('/create-survey', json={'title': title, 'description': 'Test', 'questions': []}, cookies={**test_token, 'user_id': test_user.uuid})

    data = await res.json()

    assert res.status == 201
    print(dumps(data.get('survey'), indent=4))