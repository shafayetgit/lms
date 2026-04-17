from fastapi import APIRouter
from .endpoints import auth, users, categories, courses, reviews, wishlist, modules, lessons, lesson_progress, discussions, comments, enrollments, quizzes, questions, quiz_attempts

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["Wishlist"])
api_router.include_router(modules.router, prefix="/modules", tags=["Modules"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
api_router.include_router(lesson_progress.router, prefix="/lesson-progress", tags=["Lesson Progress"])
api_router.include_router(discussions.router, prefix="/discussions", tags=["Discussions"])
api_router.include_router(comments.router, prefix="/comments", tags=["Comments"])
api_router.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["Quizzes"])
api_router.include_router(questions.router, prefix="/questions", tags=["Questions"])
api_router.include_router(quiz_attempts.router, prefix="/quiz-attempts", tags=["Quiz Attempts"])