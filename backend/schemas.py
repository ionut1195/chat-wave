from pydantic import BaseModel
from datetime import datetime
from typing import List


class MessageBase(BaseModel):
    content: str
    files: list[str] = []


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int

    class Confirg:
        orm_mode = True


class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    username: str
    password: str


class User(UserBase):
    id: int
    username: str
    messages: list[Message] = []

    class Config:
        orm_mode: True


class NewUser(UserBase):
    username: str
    access_token: str
    refresh_token: str


class ConversationBase(BaseModel):
    users: list[int] = []


class ConversationCreate(ConversationBase):
    name: str = None


class ConversationUpdate(ConversationBase):
    pass


class Conversation(ConversationBase):
    id: int
    name: str
    messages: list[str] = []
    created_at: datetime
    users: List[User]
    messages: List[Message]


class Token(BaseModel):
    token_type: str
    access_token: str
    refresh_token: str
