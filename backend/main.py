from fastapi import Depends, FastAPI, HTTPException, WebSocketException, status,  WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated, List, Union
from datetime import timedelta
from schemas import User, UserCreate, NewUser, Token, Conversation, ConversationUpdate, ConversationCreate
from auth import Token, get_current_user, authenticate_user, create_token, get_refreshed_token
from crud import get_user_by_email, create_user, get_users, delete_user, get_user, get_conversation, get_user_conversations, create_conversation, delete_conversation
from database import get_db, Base, engine
from sqlalchemy.orm import Session
import base64
import json

from fastapi.middleware.cors import CORSMiddleware


ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
Base.metadata.create_all(engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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


@app.get("/users", response_model=List[User])
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


def get_conversation_name(participants: List[int], db: Session):
    first_user = get_user(db, participants[0])
    if len(participants) < 2:
        return first_user.username
    else:
        second_user = get_user(db, participants[1])
    return f"{first_user.username}, {second_user.username} + {len(participants) -1} others"


@app.post("/conversations", response_model=Conversation)
def create_new_conversation(
    new_conversation: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    users = list(new_conversation.users)
    if new_conversation.name is not None:
        conversation_name = new_conversation.name
    else:
        conversation_name = get_conversation_name(users, db)
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
    print(form_data)
    user = authenticate_user(
        db, form_data.username, form_data.password)
    print(user)
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


@app.websocket("/conversation/{conversation_id}/ws")
async def websocket_endpoint(websocket: WebSocket, conversation_id: int,  db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        # if not current_user:
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Invalid access token",
        #         headers={"WWW-Authenticate": "Bearer"},
        #     )
        while True:
            data: dict = json.loads(await websocket.receive_text())
            print(data)
            conversation = get_conversation(conversation_id, db)
            if not conversation:
                raise WebSocketException("Conversation not found", close=4001)
            # user_id = data.get("id")
            # user_message = data.get("message")
            # user_files = data.get("files")
            # for file in user_files:
            #     content = file.get("content")
            #     filename = file.get("filename")
            #     if content and filename:
            #         file_bytes = base64.b64decode(content)
            #         with open(f"uploads/{filename}", "wb") as f:
            #             f.write(file_bytes)

            # print("Received files from user", user_id)
    except WebSocketDisconnect:
        print("WebSocket connection closed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
