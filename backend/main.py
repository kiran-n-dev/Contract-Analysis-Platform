from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os

from schemas import UserCreate, User, Document
from auth import auth_service, password_utils
from database import get_db, engine
from models import user, document, analysis_result
from services import document_service, analysis_service

user.Base.metadata.create_all(bind=engine)
document.Base.metadata.create_all(bind=engine)
analysis_result.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session Middleware (for simple session management)
# In a real application, consider a more robust session management solution
# that might involve a dedicated session store (e.g., Redis).
# For this project, we'll use a simple cookie-based session.
from starlette.middleware.sessions import SessionMiddleware
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "super-secret-key"))


@app.post("/api/auth/register", response_model=User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return auth_service.create_user(db=db, username=user.username, email=user.email, password=user.password)


@app.post("/api/auth/login")
def login(form_data: UserCreate, request: Request, response: Response, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_username(db, username=form_data.username)
    if not user or not password_utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    request.session["user_id"] = user.id
    request.session["username"] = user.username
    return {"message": "Login successful", "user_id": user.id, "username": user.username}


@app.get("/api/auth/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/api/auth/logout")
def logout(request: Request):
    request.session.clear()
    return {"message": "Logout successful"}


def get_current_user(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = auth_service.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@app.post("/api/documents/upload", response_model=Document)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_document = document_service.create_document(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        file_name=file.filename,
        file_size=file.file._file.tell(),
        mime_type=file.content_type,
        file=file.file,
    )
    # background_tasks.add_task(analysis_service.analyze_document, db, db_document)
    return db_document


@app.get("/api/documents", response_model=List[Document])
def get_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(document.Document).filter(document.Document.user_id == current_user.id).all()


@app.get("/api/documents/{document_id}", response_model=Document)
def get_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_document = db.query(document.Document).filter(document.Document.id == document_id, document.Document.user_id == current_user.id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found or you don't have permission to access it")
    return db_document


@app.post("/api/documents/{document_id}/analyze")
def analyze_document_on_demand(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_document = db.query(document.Document).filter(document.Document.id == document_id, document.Document.user_id == current_user.id).first()
    if not db_document:
        raise HTTPException(status_code=404, detail="Document not found or you don't have permission to access it")
    
    analysis_results = analysis_service.analyze_document(db, db_document)
    
    if not analysis_results:
        raise HTTPException(status_code=500, detail="Failed to analyze document")
        
    return analysis_results


from services import document_service, analysis_service, gemini_analyzer

@app.get("/")
def read_root():
    return {"Hello": "World"}
