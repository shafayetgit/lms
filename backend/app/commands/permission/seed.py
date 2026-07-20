import asyncio
import argparse
import json
import os
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.db.session import get_session_maker
from app.models.role import Role
from app.models.permission import Permission


async def seed_permissions_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            permissions_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(permissions_data, dict):
        print("Error: Fixture file must contain a JSON object mapping roles to resources.")
        return

    session_maker = get_session_maker()

    print("Starting seed process for permissions...\n")

    async with session_maker() as db:
        for role_slug, resources in permissions_data.items():
            # Find the role
            query_role = select(Role).where(Role.slug == role_slug)
            res_role = await db.execute(query_role)
            role = res_role.scalars().first()

            if not role:
                print(f"Warning: Role with slug '{role_slug}' not found in database. Skipping permissions.")
                continue

            for resource_name, perms in resources.items():
                # Check if permission already exists
                query_perm = select(Permission).where(
                    Permission.role_id == role.id,
                    Permission.resource == resource_name
                )
                res_perm = await db.execute(query_perm)
                permission = res_perm.scalars().first()

                read = perms.get("read", False)
                create = perms.get("create", False)
                update = perms.get("update", False)
                delete = perms.get("delete", False)
                export = perms.get("export", False)
                import_val = perms.get("import", False)
                only_if_creator = perms.get("only_if_creator", False)

                if permission:
                    print(f"Updating permissions for role '{role.name}' on resource '{resource_name}'...")
                    permission.read = read
                    permission.create = create
                    permission.update = update
                    permission.delete = delete
                    permission.export = export
                    permission.import_perm = import_val
                    permission.only_if_creator = only_if_creator
                else:
                    print(f"Creating permissions for role '{role.name}' on resource '{resource_name}'...")
                    permission = Permission(
                        role_id=role.id,
                        resource=resource_name,
                        read=read,
                        create=create,
                        update=update,
                        delete=delete,
                        export=export,
                        import_perm=import_val,
                        only_if_creator=only_if_creator
                    )
                    db.add(permission)

        try:
            await db.commit()
            try:
                from app.caches.permission import invalidate_permission_cache
                await invalidate_permission_cache()
            except Exception as cache_err:
                print(f"Warning: Failed to invalidate permission cache: {cache_err}")
            print("\nPermissions seeded successfully!")
        except Exception as e:
            await db.rollback()
            print(f"Error saving permissions: {e}")


def main():
    default_path = Path(__file__).parent / "data.json"
    
    parser = argparse.ArgumentParser(description="Seed database with permissions from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_permissions_command(args.file))


if __name__ == "__main__":
    main()
