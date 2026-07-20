import sys
import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy import select

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parents[3]))

from app.core.security import get_password_hash
from app.db.session import get_session_maker
from app.models.user import User
from app.models.role import Role


async def seed_users_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            users_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(users_data, list):
        print("Error: Fixture file must contain a JSON array (list) of users.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(users_data)} users...\n")

    async with session_maker() as db:
        roles_cache = {}

        for idx, u_data in enumerate(users_data, 1):
            username = u_data.get("username")
            email = u_data.get("email")
            first_name = u_data.get("first_name", "User")
            last_name = u_data.get("last_name", str(idx))
            password = u_data.get("password", "Password123!")
            role_slug = u_data.get("role", "student")

            if not username or not email:
                print(f"Warning: Skipping user entry at index {idx} due to missing username/email.")
                continue

            if role_slug not in roles_cache:
                stmt = select(Role).where((Role.slug == role_slug) | (Role.name == role_slug))
                res = await db.execute(stmt)
                role_obj = res.scalars().first()
                if not role_obj:
                    role_obj = Role(
                        name=role_slug.title(),
                        slug=role_slug,
                        description=f"System generated {role_slug} role.",
                    )
                    db.add(role_obj)
                    await db.flush()
                roles_cache[role_slug] = role_obj
            
            user_role = roles_cache[role_slug]

            existing = await db.execute(
                select(User).where((User.username == username) | (User.email == email))
            )
            existing_user = existing.scalars().first()
            if existing_user:
                # Ensure existing user has this role
                from sqlalchemy.orm import selectinload
                stmt_user = select(User).options(
                    selectinload(User.roles),
                    selectinload(User.feature_flags)
                ).where(User.id == existing_user.id)
                res_user = await db.execute(stmt_user)
                user_loaded = res_user.scalars().first()
                if user_loaded:
                    role_added = False
                    if user_role not in user_loaded.roles:
                        user_loaded.roles.append(user_role)
                        role_added = True
                    
                    from app.models.feature_flag import FeatureFlag
                    stmt_ff = select(FeatureFlag).where(FeatureFlag.slug == "academy")
                    res_ff = await db.execute(stmt_ff)
                    ff = res_ff.scalars().first()
                    if not ff:
                        ff = FeatureFlag(
                            name="Academy",
                            slug="academy",
                            description="Enable Academy."
                        )
                        db.add(ff)
                        await db.flush()

                    flag_added = False
                    if ff not in user_loaded.feature_flags:
                        user_loaded.feature_flags.append(ff)
                        flag_added = True

                    if role_added or flag_added:
                        await db.commit()
                        if role_added:
                            print(f"Assigned role '{role_slug}' to existing user: '{username}'")
                        if flag_added:
                            print(f"Assigned feature flag 'academy' to existing user: '{username}'")
                    else:
                        print(f"User '{username}' ({email}) already exists with role '{role_slug}' and flag. Skipping.")
                continue

            user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                hashed_password=get_password_hash(password),
                is_active=True,
                email_verified=True,
                headline=u_data.get("headline"),
                bio=u_data.get("bio"),
            )
            user.roles.append(user_role)

            # Ensure global "academy" flag exists
            from app.models.feature_flag import FeatureFlag
            stmt_ff = select(FeatureFlag).where(FeatureFlag.slug == "academy")
            res_ff = await db.execute(stmt_ff)
            ff = res_ff.scalars().first()
            if not ff:
                ff = FeatureFlag(
                    name="Academy",
                    slug="academy",
                    description="Enable Academy."
                )
                db.add(ff)
                await db.flush()

            user.feature_flags.append(ff)
            db.add(user)
            await db.commit()
            print(f"Created user: '{username}' ({email}) with role '{role_slug}' and ID: {user.id}")
            print(f"Assigned feature flag 'academy' to new user: '{username}'")

    print("\nUser seed process completed successfully!")


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed database with users from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_users_command(args.file))


if __name__ == "__main__":
    main()
