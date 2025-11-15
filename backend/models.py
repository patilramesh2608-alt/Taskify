from sqlalchemy import Column, Integer, String, Boolean, create_engine, ForeignKey, DateTime, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'taskify.db')
# Allow overriding the database URL for tests/CI by setting TASKIFY_DATABASE_URL env var.
DATABASE_URL = os.getenv('TASKIFY_DATABASE_URL') or f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    tasks = relationship('Task', back_populates='owner')

    def to_dict(self):
        return {'id': self.id, 'username': self.username}

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    priority = Column(String, default='medium')  # low, medium, high
    # legacy string column (YYYY-MM-DD) kept for backwards-compatibility
    due_date = Column(String, nullable=True)
    # new canonical DateTime column for robust date handling
    due_date_dt = Column(DateTime, nullable=True)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey('users.id'))
    owner = relationship('User', back_populates='tasks')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'completed': bool(self.completed),
            'priority': self.priority,
            'due_date': self.due_date,
            # camelCase alias for frontend convenience. Prefer ISO value from due_date_dt when available.
            'dueDate': (self.due_date_dt.isoformat() if self.due_date_dt else self.due_date),
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'owner_id': self.owner_id
        }

def init_db():
    # Create any missing tables
    Base.metadata.create_all(bind=engine)

    # Simple migration: ensure `due_date` column exists on older SQLite DBs.
    # This is intentionally minimal and only adds the column if it's missing.
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if 'tasks' in tables:
            cols = [c['name'] for c in inspector.get_columns('tasks')]
            # ensure legacy string column exists
            if 'due_date' not in cols:
                with engine.connect() as conn:
                    # SQLite supports ALTER TABLE ADD COLUMN
                    conn.execute(text('ALTER TABLE tasks ADD COLUMN due_date VARCHAR'))
                    try:
                        conn.commit()
                    except Exception:
                        pass

            # ensure new DateTime column exists
            if 'due_date_dt' not in cols:
                with engine.connect() as conn:
                    conn.execute(text('ALTER TABLE tasks ADD COLUMN due_date_dt DATETIME'))
                    try:
                        conn.commit()
                    except Exception:
                        pass

            # Populate due_date_dt from existing due_date strings when possible
            if 'due_date' in cols and 'due_date_dt' in cols:
                with engine.connect() as conn:
                    res = conn.execute(text("SELECT id, due_date FROM tasks WHERE due_date IS NOT NULL AND due_date != ''"))
                    rows = res.fetchall()
                    for r in rows:
                        tid = r[0]
                        ds = r[1]
                        try:
                            # parse YYYY-MM-DD
                            dt = datetime.strptime(ds, '%Y-%m-%d')
                            # SQLite/SQLAlchemy expect a space-separated datetime string
                            formatted = dt.strftime('%Y-%m-%d %H:%M:%S')
                            conn.execute(text('UPDATE tasks SET due_date_dt = :v WHERE id = :id'), {'v': formatted, 'id': tid})
                        except Exception:
                            # ignore parsing errors for now
                            continue
                # Normalize any existing ISO-like values with 'T' to space-separated format
                with engine.connect() as conn:
                    try:
                        conn.execute(text("UPDATE tasks SET due_date_dt = replace(due_date_dt, 'T', ' ') WHERE due_date_dt LIKE '%T%'") )
                    except Exception:
                        pass
    except Exception:
        # If migration fails for any reason, continue — the app will still work for fresh DBs.
        pass

def get_session():
    return SessionLocal()
