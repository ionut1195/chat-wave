from sqlalchemy.orm import Session
from auth import get_password_hash
from sqlalchemy import select
import models
import schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, offset: int = 0, limit: int = 100):
    return db.query(models.User).offset(offset).limit(limit).all()


def get_user_messages(db: Session, user_id: int, offset: int = 0, limit: int = 100):
    return db.query(models.Message).filter(models.Message.user_id == user_id).offset(offset).limit(limit).all()


def get_message(db: Session, message_id: int):
    return db.query(models.Message).filter(models.Message.id == message_id).first()


def delete_user(db: Session, user):
    db.delete(user)
    db.commit()
    return f"User '{user.username}' deleted!"


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email, hashed_password=hashed_password, username=user.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(
        content=message.content, user_id=message.user_id, conversation_id=message.conversation_id, user_name=message.user_name)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def delete_message(db: Session, message):
    db.delete(message)
    db.commit()
    return "Message deleted!"


def create_conversation(db: Session, conversation: schemas.ConversationCreate):
    db_conversation = models.Conversation(
        name=conversation.name
    )
    for user_id in conversation.users:
        user = db.query(models.User).get(user_id)
        if user:
            db_conversation.users.append(user)
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


def get_conversation(conversation_id: int, db: Session):
    return db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()


def get_user_conversations(db: Session, user_id: int, offset: int = 0, limit: int = 10):
    subquery = select(models.Conversation.id).join(
        models.Conversation.users).where(models.User.id == user_id).as_scalar()
    return db.query(models.Conversation).filter(models.Conversation.id.in_(subquery)).offset(offset).limit(limit).all()


def delete_conversation(db: Session, conversation):
    db.delete(conversation)
    db.commit()
    return f"Conversation '{conversation.name}' deleted!"
