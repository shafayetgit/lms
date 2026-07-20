import sys
import asyncio
import argparse
import json
import os
from pathlib import Path
from datetime import date, datetime

# Add project root to sys.path for direct script execution
sys.path.append(str(Path(__file__).resolve().parents[3]))

from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from app.db.session import get_session_maker
from app.models.certificate import Certificate, CertificateEvaluation, CertificateRequest, RequestStatus, EvaluationStatus
from app.models.course import Course
from app.models.batch import Batch
from app.models.user import User


async def seed_evaluations_command(file_path: str):
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        return

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            seed_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file '{file_path}': {e}")
        return
    except Exception as e:
        print(f"Error reading file '{file_path}': {e}")
        return

    if not isinstance(seed_data, list):
        print("Error: Fixture file must contain a JSON array (list) of evaluation data.")
        return

    session_maker = get_session_maker()
    print(f"Starting seed process for {len(seed_data)} evaluation-related records...\n")

    async with session_maker() as db:
        # Fetch a default student, instructor, course, and batch to link
        user_res = await db.execute(select(User).order_by(User.id.asc()))
        users = user_res.scalars().all()
        if not users:
            print("Error: No users found in database to link seed records. Please seed users first.")
            return
            
        student = users[-1]  # Typically a seeded student
        evaluator = users[0]  # Typically the superadmin/admin or instructor
        
        course_res = await db.execute(select(Course).order_by(Course.id.asc()))
        course = course_res.scalars().first()
        if not course:
            print("Error: No courses found in database. Please seed courses first.")
            return

        batch_res = await db.execute(select(Batch).order_by(Batch.id.asc()))
        batch = batch_res.scalars().first()

        for idx, item in enumerate(seed_data, 1):
            record_type = item.get("type")
            if record_type == "request":
                req_status = RequestStatus(item.get("status", "Pending"))
                existing_res = await db.execute(
                    select(CertificateRequest).where(
                        CertificateRequest.member_id == student.id,
                        CertificateRequest.course_id == course.id,
                        CertificateRequest.status == req_status
                    )
                )
                if existing_res.scalars().first():
                    print(f"Request (Status: {req_status}) already exists. Skipping.")
                    continue

                req = CertificateRequest(
                    member_id=student.id,
                    course_id=course.id,
                    batch_id=batch.id if batch else None,
                    evaluator_id=evaluator.id,
                    status=req_status
                )
                db.add(req)
                print(f"Created CertificateRequest for student {student.email}")

            elif record_type == "evaluation":
                eval_status = EvaluationStatus(item.get("status", "Pending"))
                eval_date = datetime.strptime(item.get("date"), "%Y-%m-%d").date() if item.get("date") else None
                
                existing_res = await db.execute(
                    select(CertificateEvaluation).where(
                        CertificateEvaluation.member_id == student.id,
                        CertificateEvaluation.course_id == course.id,
                        CertificateEvaluation.status == eval_status
                    )
                )
                if existing_res.scalars().first():
                    print(f"Evaluation (Status: {eval_status}) already exists. Skipping.")
                    continue

                evaluation = CertificateEvaluation(
                    member_id=student.id,
                    course_id=course.id,
                    batch_id=batch.id if batch else None,
                    evaluator_id=evaluator.id,
                    date=eval_date,
                    start_time=item.get("start_time"),
                    end_time=item.get("end_time"),
                    status=eval_status,
                    rating=item.get("rating"),
                    summary=item.get("summary")
                )
                db.add(evaluation)
                print(f"Created CertificateEvaluation for student {student.email}")

            elif record_type == "certificate":
                issue_dt = datetime.strptime(item.get("issue_date"), "%Y-%m-%d").date() if item.get("issue_date") else date.today()
                
                existing_res = await db.execute(
                    select(Certificate).where(
                        Certificate.member_id == student.id,
                        Certificate.course_id == course.id
                    )
                )
                if existing_res.scalars().first():
                    print("Certificate already exists. Skipping.")
                    continue

                cert = Certificate(
                    member_id=student.id,
                    course_id=course.id,
                    batch_id=batch.id if batch else None,
                    issue_date=issue_dt,
                    published=item.get("published", True),
                    template=item.get("template", "Default Template")
                )
                db.add(cert)
                print(f"Created Certificate for student {student.email}")

        try:
            await db.commit()
            print("\nEvaluation/Certificate seed process completed successfully!")
        except Exception as e:
            await db.rollback()
            print(f"Error during commit: {e}")


def register_evaluation_commands(subparsers):
    parser_evaluations = subparsers.add_parser(
        "seedevaluations", help="Seed evaluations and certificate requests from JSON file"
    )
    parser_evaluations.add_argument(
        "--file",
        type=str,
        default=str(Path(__file__).parent / "data.json"),
        help="Path to evaluations JSON fixture file",
    )


def handle_evaluation_commands(args) -> bool:
    if args.command == "seedevaluations":
        asyncio.run(seed_evaluations_command(args.file))
        return True
    return False


def main():
    default_path = Path(__file__).parent / "data.json"

    parser = argparse.ArgumentParser(description="Seed database with evaluations/certificates from a JSON fixture file.")
    parser.add_argument(
        "--file",
        default=str(default_path),
        help=f"Path to JSON fixtures file (default: {default_path})",
    )

    args = parser.parse_args()
    asyncio.run(seed_evaluations_command(args.file))


if __name__ == "__main__":
    main()
