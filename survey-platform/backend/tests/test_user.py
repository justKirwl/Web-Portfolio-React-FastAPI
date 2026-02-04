import pytest

@pytest.mark.asyncio
async def test_get_profile(client_session, test_user, test_token):
    res = await client_session.get('/get-profile', cookies={**test_token, 'user_id': test_user.uuid})

    data = await res.json()

    assert res.status == 200
    
    assert 'profile' in data
    assert 'surveys' in data
    assert 'quizes' in data
    assert 'responses' in data