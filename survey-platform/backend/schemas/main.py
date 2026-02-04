from pydantic import BaseModel, EmailStr, ConfigDict

class SendContactSchema(BaseModel):
    username: str
    email: EmailStr
    subject: str
    message: str

class ForgotPasswordSchema(BaseModel):
    model_config = ConfigDict(extra='allow')

    email: EmailStr

class ChangePasswordConfirmationSchema(BaseModel):
    token: str

class SendTwoFactorCodeSchema(BaseModel):
    emailOrUsername: str