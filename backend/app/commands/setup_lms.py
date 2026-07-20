import sys
import asyncio
import argparse
from pathlib import Path

# Add project root to sys.path for direct script execution
sys.path.append(str(Path(__file__).resolve().parents[2]))

from app.commands.roles.seed import seed_roles_command
from app.commands.permission.seed import seed_permissions_command
from app.commands.permission.sync_models import sync_permission_models
from app.commands.user.seed import seed_users_command
from app.commands.category.seed import seed_categories_command
from app.commands.feature_flag.seed import seed_feature_flags_command
from app.commands.course.seed import seed_courses_command
from app.commands.batch.seed import seed_batches_command
from app.commands.enrollment.seed import seed_enrollments_command
from app.commands.quiz.seed import seed_quizzes_command
from app.commands.assignment.seed import seed_assignments_command
from app.commands.program.seed import seed_programs_command
from app.commands.evaluation.seed import seed_evaluations_command
from app.commands.badge.seed import seed_badges_command
from app.commands.review.seed import seed_reviews_command
from app.commands.settings.seed import seed_settings_command


async def setup_lms_command(
    settings_file: str,
    roles_file: str,
    permissions_file: str,
    users_file: str,
    categories_file: str,
    feature_flags_file: str,
    courses_file: str,
    batches_file: str,
    enrollments_file: str,
    quizzes_file: str,
    assignments_file: str,
    programs_file: str,
    evaluations_file: str,
    badges_file: str,
    reviews_file: str,
):
    # Run setup sequences in order of database dependency
    print("==================================================")
    print("Starting LMS Database Setup / Seeding")
    print("==================================================")

    print("\n[0/14] Seeding Settings...")
    await seed_settings_command(settings_file)

    print("\n[1/14] Seeding Roles...")
    await seed_roles_command(roles_file)

    print("\n[2/13] Syncing & Seeding Permissions...")
    sync_permission_models()
    await seed_permissions_command(permissions_file)

    print("\n[3/13] Seeding Users...")
    await seed_users_command(users_file)

    print("\n[4/13] Seeding Categories...")
    await seed_categories_command(categories_file)

    print("\n[5/13] Seeding Feature Flags...")
    await seed_feature_flags_command(feature_flags_file)

    print("\n[6/14] Seeding Quizzes...")
    await seed_quizzes_command(quizzes_file)

    print("\n[7/14] Seeding Assignments...")
    await seed_assignments_command(assignments_file)

    print("\n[8/14] Seeding Courses...")
    await seed_courses_command(courses_file)

    print("\n[9/14] Seeding Batches...")
    await seed_batches_command(batches_file)



    print("\n[11/14] Seeding Programs...")
    await seed_programs_command(programs_file)

    print("\n[12/14] Seeding Badges...")
    await seed_badges_command(badges_file)



    print("\n==================================================")
    print("LMS Database Setup Completed Successfully!")
    print("==================================================")


def main():
    base_dir = Path(__file__).parent
    default_settings = base_dir / "settings" / "data.json"
    default_roles = base_dir / "roles" / "data.json"
    default_permissions = base_dir / "permission" / "data.json"
    default_users = base_dir / "user" / "data.json"
    default_categories = base_dir / "category" / "data.json"
    default_feature_flags = base_dir / "feature_flag" / "data.json"
    default_courses = base_dir / "course" / "data.json"
    default_batches = base_dir / "batch" / "data.json"
    default_enrollments = base_dir / "enrollment" / "data.json"
    default_quizzes = base_dir / "quiz" / "data.json"
    default_assignments = base_dir / "assignment" / "data.json"
    default_programs = base_dir / "program" / "data.json"
    default_evaluations = base_dir / "evaluation" / "data.json"
    default_badges = base_dir / "badge" / "data.json"
    default_reviews = base_dir / "review" / "data.json"

    parser = argparse.ArgumentParser(description="Seed LMS database with all default fixtures.")
    parser.add_argument(
        "--settings-file",
        default=str(default_settings),
        help=f"Path to settings JSON file (default: {default_settings})",
    )
    parser.add_argument(
        "--roles-file",
        default=str(default_roles),
        help=f"Path to roles JSON file (default: {default_roles})",
    )
    parser.add_argument(
        "--permissions-file",
        default=str(default_permissions),
        help=f"Path to permissions JSON file (default: {default_permissions})",
    )
    parser.add_argument(
        "--users-file",
        default=str(default_users),
        help=f"Path to users JSON file (default: {default_users})",
    )
    parser.add_argument(
        "--categories-file",
        default=str(default_categories),
        help=f"Path to categories JSON file (default: {default_categories})",
    )
    parser.add_argument(
        "--feature-flags-file",
        default=str(default_feature_flags),
        help=f"Path to feature flags JSON file (default: {default_feature_flags})",
    )
    parser.add_argument(
        "--courses-file",
        default=str(default_courses),
        help=f"Path to courses JSON file (default: {default_courses})",
    )
    parser.add_argument(
        "--batches-file",
        default=str(default_batches),
        help=f"Path to batches JSON file (default: {default_batches})",
    )
    parser.add_argument(
        "--enrollments-file",
        default=str(default_enrollments),
        help=f"Path to enrollments JSON file (default: {default_enrollments})",
    )
    parser.add_argument(
        "--quizzes-file",
        default=str(default_quizzes),
        help=f"Path to quizzes JSON file (default: {default_quizzes})",
    )
    parser.add_argument(
        "--assignments-file",
        default=str(default_assignments),
        help=f"Path to assignments JSON file (default: {default_assignments})",
    )
    parser.add_argument(
        "--programs-file",
        default=str(default_programs),
        help=f"Path to programs JSON file (default: {default_programs})",
    )
    parser.add_argument(
        "--evaluations-file",
        default=str(default_evaluations),
        help=f"Path to evaluations JSON file (default: {default_evaluations})",
    )
    parser.add_argument(
        "--badges-file",
        default=str(default_badges),
        help=f"Path to badges JSON file (default: {default_badges})",
    )
    parser.add_argument(
        "--reviews-file",
        default=str(default_reviews),
        help=f"Path to reviews JSON file (default: {default_reviews})",
    )

    args = parser.parse_args()
    asyncio.run(
        setup_lms_command(
            args.settings_file,
            args.roles_file,
            args.permissions_file,
            args.users_file,
            args.categories_file,
            args.feature_flags_file,
            args.courses_file,
            args.batches_file,
            args.enrollments_file,
            args.quizzes_file,
            args.assignments_file,
            args.programs_file,
            args.evaluations_file,
            args.badges_file,
            args.reviews_file,
        )
    )


if __name__ == "__main__":
    main()
