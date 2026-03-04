import uuid
from app.extensions import db
from app.models.course_models import Grade, CourseClass, Subject
from app.models.student_model import Student

class GradeService:
    @staticmethod
    def calculate_total_score(regular, midterm, final):
        """Standard calculation: 10% regular, 40% midterm, 50% final."""
        if regular is None or midterm is None or final is None:
            return None
        return (regular * 0.1) + (midterm * 0.4) + (final * 0.5)

    @staticmethod
    def get_status_from_score(total):
        """Return PASSED or FAILED based on total score."""
        if total is None:
            return "ENROLLED"
        return "PASSED" if total >= 4.0 else "FAILED"

    @staticmethod
    def get_student_grades(student_db_id):
        """Fetch and format grades for a student portal view."""
        grades = Grade.query.filter_by(student_id=student_db_id).all()
        results = []
        for g in grades:
            results.append({
                "grade_id": str(g.id),
                "class_id": str(g.course_class_id),
                "class_name": g.course_class.name if g.course_class else "Unknown",
                "subject_name": g.course_class.subject.name if (g.course_class and g.course_class.subject) else "Unknown",
                "credits": g.course_class.subject.credits if (g.course_class and g.course_class.subject) else 0,
                "scores": {
                    "regular": g.regular_score,
                    "midterm": g.midterm_score,
                    "final": g.final_score,
                    "total": g.total_score
                },
                "status": g.status,
                "onchain_hash": g.onchain_hash,
                "is_finalized": g.is_finalized,
                "review_notes": g.review_notes
            })
        return results

    @staticmethod
    def update_grade_score(grade_id, scores, caller_is_khao_thi=False, lecturer_id=None):
        """Update scores and auto-calculate total/status."""
        if isinstance(grade_id, str): grade_id = uuid.UUID(grade_id)
        
        grade = db.session.get(Grade, grade_id)
        if not grade:
            return None, "Không tìm thấy bản ghi điểm"

        if lecturer_id and grade.course_class.lecturer_id != lecturer_id:
            return None, "Access denied"

        if grade.is_finalized and not caller_is_khao_thi:
            return None, "Điểm đã chốt, không thể chỉnh sửa"
        
        if grade.is_pending_review and not caller_is_khao_thi:
             return None, "Điểm đang chờ duyệt, không thể chỉnh sửa"

        if "regular" in scores: grade.regular_score = scores["regular"]
        if "midterm" in scores: grade.midterm_score = scores["midterm"]
        if "final" in scores: grade.final_score = scores["final"]
        if "total" in scores and caller_is_khao_thi: grade.total_score = scores["total"]
        if "status" in scores and caller_is_khao_thi: grade.status = scores["status"]

        if not ("total" in scores and caller_is_khao_thi):
            total = GradeService.calculate_total_score(grade.regular_score, grade.midterm_score, grade.final_score)
            if total is not None:
                grade.total_score = total
                grade.status = GradeService.get_status_from_score(total)

        db.session.commit()
        return grade, None

    @staticmethod
    def finalize_grades(course_class_id=None, grade_id=None):
        """Finalize grades (Khao Thi action)."""
        if grade_id:
            if isinstance(grade_id, str): grade_id = uuid.UUID(grade_id)
            grade = db.session.get(Grade, grade_id)
            if not grade: return False, "Grade not found"
            grade.is_finalized = True
            grade.is_pending_review = False
            grade.status = "Đã chốt"
        elif course_class_id:
            if isinstance(course_class_id, str): course_class_id = uuid.UUID(course_class_id)
            course_class = db.session.get(CourseClass, course_class_id)
            if not course_class: return False, "Class not found"
            for g in course_class.grades:
                g.is_finalized = True
                g.is_pending_review = False
                g.status = "Đã chốt"
        
        db.session.commit()
        return True, None
