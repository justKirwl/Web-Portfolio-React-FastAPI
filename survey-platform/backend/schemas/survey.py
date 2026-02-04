from pydantic import BaseModel, EmailStr, ConfigDict

class CreateSurveySchema(BaseModel):
    title: str
    description: str
    questions: list
    language: str
    difficulty: str
    tags: list

class ShareSurveySchema(BaseModel):
    surveyUrl: str
    toEmail: EmailStr

class RequestAgainSchema(BaseModel):
    surveyId: str
    expiresAt: int

class UpdateSurveySchema(BaseModel):
    model_config = ConfigDict(extra='allow')
    
    surveyId: str

class SetSurveyRatingSchema(BaseModel):
    surveyId: str
    rating: int