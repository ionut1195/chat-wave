from pydantic import BaseModel
from datetime import datetime
from typing import List, Union


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    content: str
    conversation_id: int
    user_id: int
    user_name: str


class Message(MessageBase):
    id: int
    content: str
    created_at: datetime
    conversation_id: int
    user_id: int
    user_name: str


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


class UserReturnType(BaseModel):
    id: int
    username: str


class NewUser(UserBase):
    username: str
    access_token: str
    refresh_token: str


class ConversationBase(BaseModel):
    users: list[int] = []


class ConversationCreate(ConversationBase):
    name: Union[str, None] = None


class ConversationUpdate(ConversationBase):
    pass


class Conversation(ConversationBase):
    id: int
    name: Union[str, None]
    messages: list[str] = []
    created_at: datetime
    users: List[User]
    messages: List[Message]


class Token(BaseModel):
    token_type: str
    access_token: str
    refresh_token: str
