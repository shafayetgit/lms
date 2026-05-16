# app/shared/filters.py

# Common filterable fields across most models
ALLOWED_FILTERS = {
    "id",
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
    
    # Handle other operators
    operators = {
        "eq": column == value,
        "ne": column != value,
        "gt": column > value,
        "gte": column >= value,
        "lt": column < value,
        "lte": column <= value,
        "like": column.ilike(f"%{value}%"),
    }

    if operator not in operators:
        raise ValueError(f"Unsupported operator: {operator}")

    return operators[operator]


def build_conditions(model, filters):

    conditions = []

    for item in filters:
        if item.field not in ALLOWED_FILTERS:
            raise ValueError(f"Invalid filter field: {item.field}")

        if not hasattr(model, item.field):
            raise ValueError(f"Model does not have field: {item.field}")

        column = getattr(model, item.field)

        expression = build_expression(
            column,
            item.operator,
            item.value,
        )

        conditions.append(expression)

    return conditions
