from pydantic import BaseModel

class UpdateFavoriteFlagSchema(BaseModel):
    chatId: str

class UpdateChatTitleSchema(BaseModel):
    chatId: str
    newTitle: str

class UpgradePlanSchema(BaseModel):
    plan: str

class SendSupportMessageSchema(BaseModel):
    message: str

class UpdateDataSchema(BaseModel):
    avatarId: int
    fullName: str
    displayName: str
    preferences: str | None
    workFunction: str | None
    colorMode: str
    billingPlan: str

class UpdateMessageSchema(BaseModel):
    newContent: str
    messageId: str