from fastapi import APIRouter
from .endpoints import auth, users, oauth

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(oauth.router, prefix="/auth")  # OAuth under auth but with internal prefix