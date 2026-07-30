from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api.deps import get_db, get_current_active_user
from app.models.course import Course
from app.models.user import User
from app.models.enrollment import Enrollment
from app.models.certificate import Certificate
from app.models.category import Category
from app.models.payment import Payment, PaymentStatus
from datetime import datetime, timedelta
from collections import defaultdict
from app.caches.statistics import get_cached_statistics, set_cached_statistics
from app.core.cache import CacheService

router = APIRouter()

@router.get("/")
async def get_statistics(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Retrieve LMS dashboard statistics."""
    cached_stats = await get_cached_statistics()
    if cached_stats:
        return cached_stats

    # Active users
    users_result = await db.execute(select(func.count()).select_from(User).where(User.is_active == True))
    users_count = users_result.scalar() or 0

    # Published courses
    courses_result = await db.execute(select(func.count()).select_from(Course).where(Course.published == True))
    courses_count = courses_result.scalar() or 0

    # Enrollments
    enrollments_result = await db.execute(select(func.count()).select_from(Enrollment))
    enrollments_count = enrollments_result.scalar() or 0

    # Certifications
    certs_result = await db.execute(select(func.count()).select_from(Certificate))
    certs_count = certs_result.scalar() or 0
    
    # Completions
    completions_result = await db.execute(select(func.count()).select_from(Enrollment).where(Enrollment.progress >= 100))
    completions_count = completions_result.scalar() or 0

    # Enrollment trend (last 30 days, grouped by day)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_enrollments_result = await db.execute(
        select(Enrollment.enrolled_at).where(Enrollment.enrolled_at >= thirty_days_ago)
    )
    recent_enrollments = recent_enrollments_result.scalars().all()

    trend_map = defaultdict(int)
    for dt in recent_enrollments:
        if dt:
            trend_map[dt.date().strftime("%b %d")] += 1

    enrollment_trend = []
    for i in range(29, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).strftime("%b %d")
        enrollment_trend.append({"date": day, "count": trend_map.get(day, 0)})

    # Category distribution (courses per category)
    category_dist_result = await db.execute(
        select(Category.name, func.count(Course.id).label("count"))
        .join(Course, Course.category_id == Category.id, isouter=True)
        .where(Course.published == True)
        .group_by(Category.id, Category.name)
        .order_by(func.count(Course.id).desc())
        .limit(8)
    )
    category_distribution = [
        {"category": row.name, "count": row.count}
        for row in category_dist_result.all()
    ]

    # Revenue trend (last 30 days, completed payments)
    revenue_result = await db.execute(
        select(Payment.created_at, Payment.amount)
        .where(
            Payment.status == PaymentStatus.COMPLETED,
            Payment.created_at >= thirty_days_ago
        )
    )
    revenue_rows = revenue_result.all()
    revenue_map = defaultdict(float)
    for row in revenue_rows:
        if row.created_at:
            revenue_map[row.created_at.date().strftime("%b %d")] += float(row.amount or 0)

    revenue_trend = []
    for i in range(29, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).strftime("%b %d")
        revenue_trend.append({"date": day, "amount": round(revenue_map.get(day, 0), 2)})

    # Top courses by enrollment count
    top_courses_result = await db.execute(
        select(Course.title, func.count(Enrollment.id).label("enrollments"))
        .join(Enrollment, Enrollment.course_id == Course.id)
        .group_by(Course.id, Course.title)
        .order_by(func.count(Enrollment.id).desc())
        .limit(6)
    )
    top_courses = [
        {"title": row.title, "enrollments": row.enrollments}
        for row in top_courses_result.all()
    ]

    # Enrollment status breakdown
    status_result = await db.execute(
        select(Enrollment.status, func.count(Enrollment.id).label("count"))
        .group_by(Enrollment.status)
    )
    status_breakdown = [
        {"status": row.status.capitalize() if isinstance(row.status, str) else str(row.status).capitalize(), "count": row.count}
        for row in status_result.all()
    ]

    # Revenue summary
    total_revenue_result = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .where(Payment.status == PaymentStatus.COMPLETED)
    )
    total_revenue = float(total_revenue_result.scalar() or 0)

    response_data = {
        "success": True,
        "data": {
            "users": users_count,
            "courses": courses_count,
            "enrollments": enrollments_count,
            "certifications": certs_count,
            "completions": completions_count,
            "total_revenue": round(total_revenue, 2),
            "trend": enrollment_trend,
            "revenue_trend": revenue_trend,
            "category_distribution": category_distribution,
            "top_courses": top_courses,
            "status_breakdown": status_breakdown
        }
    }
    
    await set_cached_statistics(response_data)
            
    return response_data



