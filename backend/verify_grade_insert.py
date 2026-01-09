from app import create_app
from app.extensions import db
from app.models.student_model import Student
from app.models.account_model import Account
from app.models.course_models import Grade, CourseClass, Subject, Semester
import uuid

app = create_app()

with app.app_context():
    print(">>> VERIFY GRADE INSERTION <<<")
    try:
        # 1. Create Dummy Account & Student
        acc_uid = uuid.uuid4()
        acc = Account(id=acc_uid, username=f"test_grade_{acc_uid.hex[:6]}", password_hash="hash", role="student")
        db.session.add(acc)
        
        stu_uid = uuid.uuid4()
        stu = Student(id=stu_uid, account_id=acc_uid, student_id=f"S_{stu_uid.hex[:6]}")
        db.session.add(stu)
        
        db.session.commit()
        print(f"Student Created: {stu.id}")
        
        # 2. Create Dummy Class
        # Need Subject & Semester first? or assume existing?
        # Let's create minimal
        sub = Subject(subject_code=f"SUB_{uuid.uuid4().hex[:4]}", name="TestSub", credits=3)
        db.session.add(sub)
        sem = Semester(code=f"SEM_{uuid.uuid4().hex[:4]}", name="TestSem")
        db.session.add(sem)
        db.session.commit() # commit to get IDs
        
        cls = CourseClass(class_code=f"CLS_{uuid.uuid4().hex[:4]}", name="TestClass", subject_id=sub.id, semester_id=sem.id)
        db.session.add(cls)
        db.session.commit()
        print(f"Class Created: {cls.id}")
        
        # 3. Create Grade
        grade = Grade(student_id=stu.id, course_class_id=cls.id)
        db.session.add(grade)
        db.session.commit()
        
        print(f"Grade Created Successfully: {grade.id}")
        
    except Exception as e:
        print(f"!!! ERROR: {e}")
        db.session.rollback()
