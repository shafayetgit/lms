"""
OAuth2 Service
Handles Google and GitHub OAuth authentication.
"""

import httpx
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from urllib.parse import urlencode

from app.core.config import init_settings


class GoogleOAuthService:
    """Service for Google OAuth authentication."""

    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

    def __init__(self):
        self.settings = init_settings()
        self.client_id = self.settings.GOOGLE_OAUTH_CLIENT_ID
        self.client_secret = self.settings.GOOGLE_OAUTH_CLIENT_SECRET
        self.redirect_uri = self.settings.GOOGLE_OAUTH_REDIRECT_URL

    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from Google
            
        Returns:
            Dict with access_token, id_token, etc.
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "code": code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            response.raise_for_status()
            return response.json()

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        Get user information from Google using access token.
        
        Args:
            access_token: Google access token
            
        Returns:
            Dict with user info (id, email, name, picture, etc.)
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return response.json()

    def get_authorization_url(self, state: str) -> str:
        """
        Get Google authorization URL for OAuth flow.
        
        Args:
            state: CSRF token
            
        Returns:
            Authorization URL
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"


class GitHubOAuthService:
    """Service for GitHub OAuth authentication."""

    AUTHORIZATION_URL = "https://github.com/login/oauth/authorize"
    TOKEN_URL = "https://github.com/login/oauth/access_token"
    USERINFO_URL = "https://api.github.com/user"

    def __init__(self):
        self.settings = init_settings()
        self.client_id = self.settings.GITHUB_OAUTH_CLIENT_ID
        self.client_secret = self.settings.GITHUB_OAUTH_CLIENT_SECRET
        self.redirect_uri = self.settings.GITHUB_OAUTH_REDIRECT_URL

    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from GitHub
            
        Returns:
            Dict with access_token, token_type, etc.
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                },
                headers={"Accept": "application/json"},
            )
            response.raise_for_status()
            return response.json()

    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        Get user information from GitHub using access token.
        
        Args:
            access_token: GitHub access token
            
        Returns:
            Dict with user info (id, login, email, avatar_url, etc.)
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.USERINFO_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json",
                },
            )
            response.raise_for_status()
            return response.json()

    def get_authorization_url(self, state: str) -> str:
        """
        Get GitHub authorization URL for OAuth flow.
        
        Args:
            state: CSRF token
            
        Returns:
            Authorization URL
        """
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "user:email",
            "state": state,
        }
        return f"{self.AUTHORIZATION_URL}?{urlencode(params)}"


def get_google_oauth_service() -> GoogleOAuthService:
    """Get Google OAuth service instance."""
    return GoogleOAuthService()


def get_github_oauth_service() -> GitHubOAuthService:
    """Get GitHub OAuth service instance."""
    return GitHubOAuthService()
