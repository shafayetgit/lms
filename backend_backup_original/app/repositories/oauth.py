"""
OAuth Account Repository
Data access layer for OAuth account management.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_

from app.models.user import OAuthAccount, User
from datetime import datetime, timezone


async def create_oauth_account(
    db: AsyncSession,
    user_id: int,
    provider: str,
    provider_user_id: str,
    provider_email: str = None,
    profile_data: str = None,
) -> OAuthAccount:
    """Create a new OAuth account linked to a user."""
    oauth_account = OAuthAccount(
        user_id=user_id,
        provider=provider,
        provider_user_id=provider_user_id,
        provider_email=provider_email,
        profile_data=profile_data,
    )
    db.add(oauth_account)
    await db.commit()
    await db.refresh(oauth_account)
    return oauth_account


async def get_oauth_account_by_provider(
    db: AsyncSession,
    provider: str,
    provider_user_id: str,
) -> OAuthAccount | None:
    """Get OAuth account by provider and provider user ID."""
    result = await db.execute(
        select(OAuthAccount).where(
            and_(
                OAuthAccount.provider == provider,
                OAuthAccount.provider_user_id == provider_user_id,
            )
        )
    )
    return result.scalars().first()


async def get_oauth_accounts_by_user_id(
    db: AsyncSession,
    user_id: int,
) -> list[OAuthAccount]:
    """Get all OAuth accounts linked to a user."""
    result = await db.execute(
        select(OAuthAccount).where(OAuthAccount.user_id == user_id)
    )
    return result.scalars().all()


async def get_oauth_account_by_user_and_provider(
    db: AsyncSession,
    user_id: int,
    provider: str,
) -> OAuthAccount | None:
    """Get specific OAuth account for a user by provider."""
    result = await db.execute(
        select(OAuthAccount).where(
            and_(
                OAuthAccount.user_id == user_id,
                OAuthAccount.provider == provider,
            )
        )
    )
    return result.scalars().first()


async def update_oauth_account(
    db: AsyncSession,
    oauth_account: OAuthAccount,
) -> OAuthAccount:
    """Update OAuth account."""
    db.add(oauth_account)
    await db.commit()
    await db.refresh(oauth_account)
    return oauth_account


async def update_oauth_account_last_used(
    db: AsyncSession,
    oauth_account: OAuthAccount,
) -> OAuthAccount:
    """Update last used timestamp for OAuth account."""
    oauth_account.last_used_at = datetime.now(timezone.utc)
    return await update_oauth_account(db, oauth_account)


async def delete_oauth_account(
    db: AsyncSession,
    oauth_account: OAuthAccount,
) -> None:
    """Delete OAuth account."""
    await db.delete(oauth_account)
    await db.commit()


async def count_oauth_accounts_for_user(
    db: AsyncSession,
    user_id: int,
) -> int:
    """Count how many OAuth accounts are linked to a user."""
    result = await db.execute(
        select(OAuthAccount).where(OAuthAccount.user_id == user_id)
    )
    return len(result.scalars().all())


async def get_user_by_oauth(
    db: AsyncSession,
    provider: str,
    provider_user_id: str,
) -> User | None:
    """
    Find a user by their OAuth account.
    
    This is used during login to find the user associated with an OAuth provider.
    """
    result = await db.execute(
        select(User).join(OAuthAccount).where(
            and_(
                OAuthAccount.provider == provider,
                OAuthAccount.provider_user_id == provider_user_id,
            )
        )
    )
    return result.scalars().first()
