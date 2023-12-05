from fastapi import Cookie, Depends, FastAPI, HTTPException, WebSocketException, status,  WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated, List, Union
from datetime import timedelta

from fastapi.websockets import WebSocketState
from schemas import User, UserCreate, NewUser, Token, Conversation, ConversationUpdate, ConversationCreate, MessageCreate, UserReturnType
from auth import Token, get_current_user, authenticate_user, create_token, get_refreshed_token
from crud import get_user_by_email, create_user, get_users, delete_user, get_user, get_conversation, get_user_conversations, create_conversation, delete_conversation, create_message, get_message, delete_message
from database import get_db, Base, engine, SessionLocal
from sqlalchemy.orm import Session
import json
from fastapi.middleware.cors import CORSMiddleware
import os

ACCESS_TOKEN_EXPIRE_MINUTES = 30

origins = [
    os.getenv("FRONTEND_URL"),
]
print(origins)
app = FastAPI()
Base.metadata.create_all(engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/users/new", response_model=NewUser)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db=db, user=user)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_token(
        data={"sub": user.username}, expires_delta=None, expire_in_minutes=60
    )
    return NewUser(access_token=access_token, refresh_token=refresh_token, username=user.username, email=user.email)


@app.delete("/users/{user_id}")
def remove_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return delete_user(db, user)


@app.delete("/users/current/")
def remove_current_user(current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    return delete_user(db, current_user)


@app.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)]
):
    return current_user


@app.get("/users", response_model=List[UserReturnType])
def get_all_users(db: Session = Depends(get_db)):
    users = get_users(db)
    if len(users):
        return users


@app.get("/conversation/{id}", response_model=Conversation)
def get_conversation_by_id(id: int, db: Session = Depends(get_db)):
    return get_conversation(id, db=db)


@app.delete("/conversation/{id}")
def delete_conversation_by_id(id: int, db: Session = Depends(get_db)):
    conversation = get_conversation(id, db=db)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return delete_conversation(db, conversation)


@app.delete("/message/{id}")
def delete_message_by_id(id: int, db: Session = Depends(get_db)):
    message = get_message(db=db, message_id=id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return delete_message(db, message)


def get_conversation_name(participants: List[int], db: Session):
    first_user = get_user(db, participants[0])
    second_user = get_user(db, participants[1])
    return f"{first_user.username}, {second_user.username} + {len(participants) -1} others"


@app.post("/conversations", response_model=Conversation)
def create_new_conversation(
    new_conversation: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    users = list(new_conversation.users)
    conversation_name = None
    if new_conversation.name is not None:
        conversation_name = new_conversation.name
    if len(users) > 2:
        new_conversation.name = get_conversation_name(users, db)
    users.append(current_user.id)
    conversation_to_add = ConversationCreate(
        users=users,
        name=conversation_name
    )

    db_conversation = create_conversation(db, conversation_to_add)
    return db_conversation


@app.get("/conversations", response_model=List[Conversation])
def get_conversations(current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    return get_user_conversations(db, user_id=current_user.id)


@app.put("/conversation/{id}", response_model=Conversation)
def update_conversation(id: int, conversation: ConversationUpdate, db: Session = Depends(get_db)):
    conversation_to_update = get_conversation(id, db)
    if conversation_to_update is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conversation_to_update.participants = conversation.participants
    db.commit()
    db.refresh(conversation_to_update)
    return conversation_to_update


@app.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_token(
        data={"sub": user.username}, expires_delta=None, expire_in_minutes=60
    )
    return Token(token_type="Bearer", access_token=access_token, refresh_token=refresh_token)


@app.post("/refresh")
def refresh_token(refresh_token: str):
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = get_refreshed_token(
        refresh_token=refresh_token, expires_delta=access_token_expires)
    return {"access_token": access_token}


@app.get("/users/{user_id}", response_model=Union[User, None])
def get_user_by_id(user_id: int, current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    if not current_user:
        return
    return get_user(db, user_id)


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            if not connection.client_state == WebSocketState.DISCONNECTED:
                await connection.send_text(message)


manager = ConnectionManager()


@app.websocket("/conversation/{conversation_id}/ws")
async def websocket_endpoint(websocket: WebSocket, conversation_id: int, token: str = Cookie(None), db: Session = Depends(get_db)):
    await manager.connect(websocket)
    db = SessionLocal()
    try:
        data = await websocket.receive_text()
        token = json.loads(data).get("token")

        current_user = await get_current_user(token=token, db=db)

        if not current_user:
            raise HTTPException(status_code=400, detail="Invalid token")
        try:
            while True:
                data: dict = json.loads(await websocket.receive_text())
                user_message = data.get("message")

                # Create a new message and add it to the database
                message_create = MessageCreate(
                    content=user_message, conversation_id=conversation_id, user_id=current_user.id, user_name=current_user.username)
                created_message = create_message(db=db, message=message_create)

                # Broadcast the message to all connected clients

                await manager.broadcast(json.dumps({"content": created_message.content, "conversation_id": created_message.conversation_id, "created_at": created_message.created_at.strftime('%Y-%m-%d %H:%M:%S'), "id": created_message.id, "user_id": created_message.user_id, "user_name": created_message.user_name}))

        except WebSocketDisconnect:
            print("WebSocket connection closed")
            # Remove the websocket from the list of connected clients
            manager.disconnect(websocket)
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
