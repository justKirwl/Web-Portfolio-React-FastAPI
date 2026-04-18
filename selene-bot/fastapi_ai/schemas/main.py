from pydantic import BaseModel

class GenerateStreamSchema(BaseModel):
    prompt: str