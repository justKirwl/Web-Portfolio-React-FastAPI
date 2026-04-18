from authlib.integrations.starlette_client import OAuth

from dotenv import load_dotenv
from os import getenv

load_dotenv()

GOOGLE_CLIENT_ID = getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = getenv('GOOGLE_CLIENT_SECRET')

GITHUB_CLIENT_ID = getenv('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = getenv('GITHUB_CLIENT_SECRET')

oauth = OAuth()

oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    access_token_url='https://oauth2.googleapis.com/token',
    access_token_params=None,
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    userinfo_endpoint='https://www.googleapis.com/oauth2/v1/userinfo',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

oauth.register(
    name='github',
    client_id=GITHUB_CLIENT_ID,
    client_secret=GITHUB_CLIENT_SECRET,
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    client_kwargs={'scope': 'read:user user:email'}
)