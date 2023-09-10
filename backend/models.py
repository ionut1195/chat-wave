from sqlalchemy import Table, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from database import Base


association_table = Table(
    "association_table",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("conversation_id", Integer, ForeignKey("conversations.id"))
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    messages = relationship("Message", back_populates="user")
    conversations = relationship(
        "Conversation", secondary=association_table, back_populates="users")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    conversation_id = Column(Integer, ForeignKey('conversations.id'))

    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User", back_populates="messages")
    conversation = relationship("Conversation", back_populates="messages")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    created_at = Column(DateTime, default=func.now())

    users = relationship("User", secondary=association_table,
                         back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")
