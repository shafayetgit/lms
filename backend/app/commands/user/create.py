import sys
import asyncio
from getpass import getpass
from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.session import get_session_maker
from app.models.user import User
from app.models.role import Role


async def create_user_with_role(
    username: str,
    email: str,
    first_name: str,
    last_name: str,
    password: str,
    role_slug: str,
):
    session_maker = get_session_maker()
    async with session_maker() as db:
        result = await db.execute(
            select(User).where((User.username == username) | (User.email == email))
        )
        existing_user = result.scalars().first()

        if existing_user:
            print(
                f"User with username '{username}' or email '{email}' already exists. Skipping creation."
            )
            return

        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            hashed_password=get_password_hash(password),
            is_active=True,
            email_verified=True,
        )

        stmt = select(Role).where(Role.slug == role_slug)
        res = await db.execute(stmt)
        role_obj = res.scalars().first()
        if not role_obj:
            role_name = "Super Admin" if role_slug == "super-admin" else "Admin"
            role_obj = Role(
                name=role_name,
                slug=role_slug,
                description=f"System generated {role_name} role.",
            )
            db.add(role_obj)
            await db.flush()

        user.roles.append(role_obj)
        db.add(user)
        await db.commit()
        print(f"User '{username}' with role '{role_slug}' created successfully.")


def register_user_commands(subparsers):
    parser_super = subparsers.add_parser(
        "createsuperadmin", help="Create a new super admin user"
    )
    parser_super.add_argument("--username", type=str, help="Username")
    parser_super.add_argument("--email", type=str, help="Email address")
    parser_super.add_argument(
        "--first-name", type=str, default="Super", help="First name"
    )
    parser_super.add_argument(
        "--last-name", type=str, default="Admin", help="Last name"
    )
    parser_super.add_argument("--password", type=str, help="Password")

    parser_admin = subparsers.add_parser("createadmin", help="Create a new admin user")
    parser_admin.add_argument("--username", type=str, help="Username")
    parser_admin.add_argument("--email", type=str, help="Email address")
    parser_admin.add_argument(
        "--first-name", type=str, default="Admin", help="First name"
    )
    parser_admin.add_argument("--last-name", type=str, default="User", help="Last name")
    parser_admin.add_argument("--password", type=str, help="Password")


def handle_user_commands(args) -> bool:
    if args.command not in ["createsuperadmin", "createadmin"]:
        return False

    role_slug = "super-admin" if args.command == "createsuperadmin" else "admin"

    username = args.username or input("Username: ")
    email = args.email or input("Email: ")
    first_name = args.first_name
    last_name = args.last_name

    password = args.password
    if not password:
        password = getpass("Password: ")
        confirm_password = getpass("Password (again): ")

        if password != confirm_password:
            print("Error: Passwords do not match.")
            sys.exit(1)

    if not username or not email or not password:
        print("Error: Username, email, and password are required.")
        sys.exit(1)

    asyncio.run(
        create_user_with_role(
            username, email, first_name, last_name, password, role_slug
        )
    )
    return True
