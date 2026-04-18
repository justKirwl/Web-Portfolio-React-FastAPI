from pydantic import BaseModel

class SendAuthCode(BaseModel):
    email: str

class VerifyAuthCode(BaseModel):
    code: str
    email: str

class RegisterSchema(BaseModel):
    email: str
    username: str