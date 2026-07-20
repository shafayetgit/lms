from fastapi import APIRouter
from .endpoints import (
    auth,
    users,
    categories,
    courses,
    reviews,
    wishlist,
    chapters,
    lessons,
    course_progress,
    discussions,
    comments,
    enrollments,
    quizzes,
    questions,
    quiz_submissions,
    media,
    crud,
    batches,
    programs,
    assignments,
    certificates,
    payments,
    badges,
    live_classes,
    settings,
    tracking,
    invitations,
    email_accounts,
    email_templates,
    instructors,
    students,
    payment_gateways,
    notifications,
    roles,
    role_profiles,
    permissions,
    feature_flags,
    user_roles,
    statistics,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(invitations.router, prefix="/invitations", tags=["Invitations"])
api_router.include_router(email_accounts.router, prefix="/email-accounts", tags=["Email Accounts"])
api_router.include_router(email_templates.router, prefix="/email-templates", tags=["Email Templates"])
api_router.include_router(instructors.router, prefix="/instructors", tags=["Instructors"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])

api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["Wishlist"])
api_router.include_router(chapters.router, prefix="/chapters", tags=["Modules"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
api_router.include_router(
    course_progress.router, prefix="/lesson-progress", tags=["Lesson Progress"]
)
api_router.include_router(
    discussions.router, prefix="/discussions", tags=["Discussions"]
)
api_router.include_router(comments.router, prefix="/comments", tags=["Comments"])
api_router.include_router(
    enrollments.router, prefix="/enrollments", tags=["Enrollments"]
)
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["Quizzes"])
api_router.include_router(questions.router, prefix="/questions", tags=["Questions"])
api_router.include_router(
    quiz_submissions.router, prefix="/quiz-submissions", tags=["Quiz Submissions"]
)
api_router.include_router(media.router, prefix="/media", tags=["Media"])
api_router.include_router(crud.router, prefix="/crud", tags=["CRUD"])
api_router.include_router(batches.router, prefix="/batches", tags=["Batches"])
api_router.include_router(programs.router, prefix="/programs", tags=["Programs"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(badges.router, prefix="/badges", tags=["Badges"])
api_router.include_router(live_classes.router, prefix="/live-classes", tags=["Live Classes"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(tracking.router, prefix="/tracking", tags=["Tracking"])
api_router.include_router(payment_gateways.router, prefix="/payment-gateways", tags=["Payment Gateways"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(role_profiles.router, prefix="/role-profiles", tags=["Role Profiles"])
api_router.include_router(permissions.router, prefix="/permissions", tags=["Permissions"])
api_router.include_router(feature_flags.router, prefix="/feature-flags", tags=["Feature Flags"])
api_router.include_router(user_roles.router, prefix="/user-roles", tags=["User Roles"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["Statistics"])
