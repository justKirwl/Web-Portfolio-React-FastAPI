import pytest

from mimesis import Person

person = Person('en')

@pytest.mark.asyncio
async def test_fetch_dashboard(client_session, test_token):
    res = await client_session.get('/fetch-dashboard', cookies=test_token)

    data = await res.json()

    assert res.status == 200
    assert data.get('success') is not None
    assert data.get('surveys') is not None
    assert data.get('quizes') is not None

@pytest.mark.asyncio
async def test_get_dropdown_data(client_session, test_token, test_user):
    res = await client_session.get('get-dropdown-data', cookies={**test_token, 'user_id': test_user.uuid})

    data = await res.json()

    assert res.status == 200
    assert data.get('user') is not None