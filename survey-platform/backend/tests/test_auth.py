import pytest

from mimesis import Person

person = Person('en')

@pytest.mark.asyncio
async def test_login_and_register(client_session, test_user, register_auto_cleanup):
    email = register_auto_cleanup
    res = await client_session.post('/register', json={'username': 'test_register', 'email': email, 'password': '00001234'})

    assert res.status == 201

    login_res = await client_session.post('/login', json={'emailOrUsername': test_user.email, 'loginPassword': '0000', 'twoFactor': False})
    
    assert login_res.status == 200