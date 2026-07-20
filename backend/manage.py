import sys
import argparse
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from app.commands.user.create import register_user_commands, handle_user_commands
from app.commands.db.flush import register_db_commands, handle_db_commands


def main():
    parser = argparse.ArgumentParser(description="Management commands for LMS Backend")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    register_user_commands(subparsers)
    register_db_commands(subparsers)

    args = parser.parse_args()

    if handle_user_commands(args):
        return

    if handle_db_commands(args):
        return

    parser.print_help()


if __name__ == "__main__":
    main()
