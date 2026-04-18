from pydantic import BaseModel

class GenerateBotContentSchema(BaseModel):
    prompt: str
    time: int
    chatId: str
    createUserMessage: bool

class NewChatSchema(BaseModel):
    title: str
    time: int

class SaveBotMessageSchema(BaseModel):
    content: str
    time: int
    thinkingTime: int

class DeleteMessageSchema(BaseModel):
    chatId: str
    messageId: str

class ResaveBotMessageSchema(BaseModel):
    chatId: str
    messageId: str
    content: str
    thinkingTime: int