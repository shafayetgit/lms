import os
import re

TEST_DIR = "app/tests"

replacements = {
    r'data\["first_name"\]': 'data["firstName"]',
    r'data\["last_name"\]': 'data["lastName"]',
    r'data\["phone_number"\]': 'data["phoneNumber"]',
    r'data\["student_id"\]': 'data["studentId"]',
    r'data\["date_of_birth"\]': 'data["dateOfBirth"]',
    r'data\["enrollment_date"\]': 'data["enrollmentDate"]',
    r'data\["is_active"\]': 'data["isActive"]',
    r'data\["created_at"\]': 'data["createdAt"]',
    r'data\["updated_at"\]': 'data["updatedAt"]',
    r'data\["deleted_at"\]': 'data["deletedAt"]',
    r'data\["parent_id"\]': 'data["parentId"]',
    r'data\["instructor_id"\]': 'data["instructorId"]',
    r'data\["course_id"\]': 'data["courseId"]',
    r'data\["category_id"\]': 'data["categoryId"]',
    r'data\["lesson_id"\]': 'data["lessonId"]',
    r'data\["quiz_id"\]': 'data["quizId"]',
    r'data\["question_id"\]': 'data["questionId"]',
    r'data\["student_count"\]': 'data["studentCount"]',
    r'data\["course_count"\]': 'data["courseCount"]',
    r'data\["average_rating"\]': 'data["averageRating"]',
    r'data\["total_reviews"\]': 'data["totalReviews"]',
    r'data\["time_limit"\]': 'data["timeLimit"]',
    r'data\["passing_score"\]': 'data["passingScore"]',
    r'data\["secure_url"\]': 'data["secureUrl"]',
    r'data\["is_used"\]': 'data["isUsed"]',
    r'"first_name" in data': '"firstName" in data',
    r'"last_name" in data': '"lastName" in data',
    r'"phone_number" in data': '"phoneNumber" in data',
    r'"student_id" in data': '"studentId" in data',
    r'"is_active" in data': '"isActive" in data',
    r'"enrollment_date" in data': '"enrollmentDate" in data',
    r'"date_of_birth" in data': '"dateOfBirth" in data',
    r'"is_used" in data': '"isUsed" in data',
}

for root, _, files in os.walk(TEST_DIR):
    for file in files:
        if file.endswith(".py"):
            path = os.path.join(root, file)
            with open(path, "r") as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content)
            
            if new_content != content:
                with open(path, "w") as f:
                    f.write(new_content)
                print(f"Updated {path}")
