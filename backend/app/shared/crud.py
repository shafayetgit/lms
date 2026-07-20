# app/shared/filters.py

# Common filterable fields across most models
ALLOWED_FILTERS = {
    "id",
    "public_id",
    "model",
    "model_id",
    "is_used",
    "is_active",
    "course_id",
    "category_id",
    "user_id",
    "student_id",
    "instructor_id",
}


def build_expression(column, operator, value):

    # Ensure value is a list for 'in' operator
    if operator == "in":
        if not isinstance(value, (list, tuple)):
            value = [value]
        return column.in_(value)

    # Handle boolean/None comparisons in SQLAlchemy 2.0
    if value in (True, False, None) and operator in ("eq", "ne"):
        return column.is_(value) if operator == "eq" else column.is_not(value)

    # Handle other operators
    if operator == "eq":
        return column == value
    elif operator == "ne":
        return column != value
    elif operator == "gt":
        return column > value
    elif operator == "gte":
        return column >= value
    elif operator == "lt":
        return column < value
    elif operator == "lte":
        return column <= value
    elif operator == "like":
        return column.ilike(f"%{value}%")
    else:
        raise ValueError(f"Unsupported operator: {operator}")


def build_conditions(model, filters):

    conditions = []

    for item in filters:
        field_name = item.field
        if field_name not in ALLOWED_FILTERS:
            raise ValueError(f"Invalid filter field: {field_name}")

        if not hasattr(model, field_name):
            raise ValueError(f"Model does not have field: {field_name}")

        column = getattr(model, field_name)

        expression = build_expression(
            column,
            item.operator,
            item.value,
        )

        conditions.append(expression)

    return conditions
