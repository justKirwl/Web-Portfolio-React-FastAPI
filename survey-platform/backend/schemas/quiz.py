from pydantic import BaseModel, ConfigDict

class CreateQuizSchema(BaseModel):
    title: str
    description: str
    timeLimit: int
    passingScore: int
    shuffleQuestions: bool
    questions: list
    topics: list
    learnings: list
    requirements: list
    language: str
    difficulty: str

class ShareQuizSchema(BaseModel):
    quizUrl: str
    toEmail: str

class RequestRetrySchema(BaseModel):
    quizId: str
    quizName: str
    expiresAt: int

class AddResponseSchema(BaseModel):
    score: int
    totalPoints: int
    maxPoints: int
    completedAt: int
    timeTaken: str

class EditQuizSchema(BaseModel):
    model_config = ConfigDict(extra='allow')

    quiz_id: str

class SetQuizRatingSchema(BaseModel):
    quizId: str
    rating: int