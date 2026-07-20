from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.badge import Badge, BadgeAssignment
from app.schemas.badge import BadgeCreate, BadgeUpdate, BadgeAssignmentCreate
from app.repositories import badge as badge_repo
from app.repositories import user as user_repo

# ---------------- BADGES ---------------- #

async def create_badge(db: AsyncSession, badge_in: BadgeCreate) -> Badge:
    existing = await badge_repo.get_badge_by_title(db, badge_in.title)
    if existing:
        raise HTTPException(status_code=400, detail="Badge with this title already exists")
        
    badge = Badge(**badge_in.model_dump())
    return await badge_repo.create_badge(db, badge)

async def update_badge(
    db: AsyncSession, badge: Badge, badge_in: BadgeUpdate
) -> Badge:
    if badge_in.title and badge_in.title != badge.title:
        existing = await badge_repo.get_badge_by_title(db, badge_in.title)
        if existing:
            raise HTTPException(status_code=400, detail="Badge with this title already exists")
            
    update_data = badge_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(badge, field, value)
    return await badge_repo.update_badge(db, badge)


# ---------------- ASSIGNMENTS ---------------- #

async def assign_badge(
    db: AsyncSession, assignment_in: BadgeAssignmentCreate, assigned_by_id: int
) -> BadgeAssignment:
    badge = await badge_repo.get_badge_by_public_id(db, assignment_in.badge_public_id)
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
        
    if not badge.is_active:
        raise HTTPException(status_code=400, detail="Cannot assign inactive badge")
        
    user = await user_repo.get_user_by_public_id(db, assignment_in.member_public_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    existing = await badge_repo.get_assignment_by_member_and_badge(
        db, member_id=user.id, badge_id=badge.id
    )
    if existing:
        raise HTTPException(status_code=400, detail="User already has this badge")
        
    assignment = BadgeAssignment(
        badge_id=badge.id,
        member_id=user.id,
        assigned_by_id=assigned_by_id
    )
    created_assignment = await badge_repo.create_assignment(db, assignment)
    # Notify user about the new badge
    from app.services import notification as notification_service
    await notification_service.create_notification(
        db=db,
        user_id=user.id,
        title="New Badge Awarded",
        message=f"You have been awarded the '{badge.title}' badge: {badge.description}" if badge.description else f"You have been awarded the '{badge.title}' badge.",
        link="/academy/badges"
    )
    return created_assignment


# ---------------- AUTOMATIC REPLICATION ENGINE ---------------- #

import ast
import operator

# Supported AST operators for safe evaluation
OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Eq: operator.eq,
    ast.NotEq: operator.ne,
    ast.Lt: operator.lt,
    ast.LtE: operator.le,
    ast.Gt: operator.gt,
    ast.GtE: operator.ge,
    ast.And: lambda a, b: a and b,
    ast.Or: lambda a, b: a or b,
}

def eval_node(node, context):
    if isinstance(node, ast.Expression):
        return eval_node(node.body, context)
    elif isinstance(node, ast.BinOp):
        return OPERATORS[type(node.op)](eval_node(node.left, context), eval_node(node.right, context))
    elif isinstance(node, ast.Compare):
        left = eval_node(node.left, context)
        for op, comparator in zip(node.ops, node.comparators):
            right = eval_node(comparator, context)
            if not OPERATORS[type(op)](left, right):
                return False
            left = right
        return True
    elif isinstance(node, ast.BoolOp):
        values = [eval_node(val, context) for val in node.values]
        if isinstance(node.op, ast.And):
            return all(values)
        elif isinstance(node.op, ast.Or):
            return any(values)
    elif isinstance(node, ast.Name):
        return context.get(node.id)
    elif isinstance(node, ast.Attribute):
        value = eval_node(node.value, context)
        if hasattr(value, node.attr):
            return getattr(value, node.attr)
        elif isinstance(value, dict):
            return value.get(node.attr)
        return None
    elif isinstance(node, ast.Constant):
        return node.value
    elif isinstance(node, ast.UnaryOp):
        operand = eval_node(node.operand, context)
        if isinstance(node.op, ast.Not):
            return not operand
        elif isinstance(node.op, ast.USub):
            return -operand
        return operand
    raise TypeError(f"Unsupported AST node type: {type(node).__name__}")

def safe_eval(expr: str, context: dict) -> bool:
    try:
        node = ast.parse(expr, mode='eval')
        return bool(eval_node(node, context))
    except Exception:
        return False

async def process_badges(db: AsyncSession, instance, event: str) -> None:
    table_name = getattr(instance, "__tablename__", None)
    if not table_name:
        return

    with db.no_autoflush:
        badges = await badge_repo.get_active_badges_for_event(db, reference_table=table_name, event=event)
    if not badges:
        return

    for badge in badges:
        if badge.event == "Value Change" and badge.field_to_check:
            from sqlalchemy import inspect
            try:
                state = inspect(instance)
                history = state.get_history(badge.field_to_check, passive=True)
                if not history.has_changes():
                    continue
            except Exception:
                pass

        if badge.condition:
            context = {
                "resource": instance,
                "resourse": instance,
                "doc": instance,
            }
            if not safe_eval(badge.condition, context):
                continue

        if not badge.user_field:
            continue
            
        user_id = getattr(instance, badge.user_field, None)
        if not user_id:
            continue

        if badge.grant_only_once:
            existing = await badge_repo.get_assignment_by_member_and_badge(
                db, member_id=user_id, badge_id=badge.id
            )
            if existing:
                continue

        assignment = BadgeAssignment(
            badge_id=badge.id,
            member_id=user_id,
            assigned_by_id=None
        )
        await badge_repo.create_assignment(db, assignment)
        # Notify user about the new badge
        from app.services import notification as notification_service
        await notification_service.create_notification(
            db=db,
            user_id=user_id,
            title="New Badge Awarded",
            message=f"You have been awarded the '{badge.title}' badge: {badge.description}" if badge.description else f"You have been awarded the '{badge.title}' badge.",
            link="/academy/badges"
        )
