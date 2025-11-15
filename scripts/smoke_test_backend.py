import json
import os
import sys

# Ensure we can import backend package modules
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, ROOT)

from backend.models import init_db, get_session, User, Task


def main():
    init_db()
    username = 'smoke_user'
    with get_session() as s:
        user = s.query(User).filter_by(username=username).first()
        if not user:
            user = User(username=username, password_hash='fakehash')
            s.add(user)
            s.commit()

        # Create a test task with due_date
        t = Task(title='Smoke test task', completed=False, priority='high', due_date='2025-12-01', category='Test', owner_id=user.id)
        s.add(t)
        s.commit()

        tasks = s.query(Task).filter_by(owner_id=user.id).all()
        out = [task.to_dict() for task in tasks]
        print(json.dumps(out, indent=2))


if __name__ == '__main__':
    main()
