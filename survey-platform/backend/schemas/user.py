from pydantic import BaseModel, EmailStr, ConfigDict

class ChangeDataSchema(BaseModel):
    displayName: str
    username: str

class ChangeEmailSchema(BaseModel):
    email: EmailStr

class UpdatePasswordSchema(BaseModel):
    current: str
    new: str

class ChangePasswordRemotelySchema(BaseModel):
    newPassword: str
    token: str

class UpdatePersonalInfoSchema(BaseModel):
    model_config = ConfigDict(extra='allow')

class SwitchTrackActivitySchema(BaseModel):
    track: bool

class MarkNotificationSchema(BaseModel):
    notifId: int

class PlanPaymentSchema(BaseModel):
    planId: str

class UpdateLanguageSchema(BaseModel):
    language: str