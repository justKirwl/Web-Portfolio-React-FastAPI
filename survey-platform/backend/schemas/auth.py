from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    emailOrUsername: str
    loginPassword: str
    twoFactor: bool

class VerifyPasswordSchema(BaseModel):
    initPassword: str