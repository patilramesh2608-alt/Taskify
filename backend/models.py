from sqlalchemy import Column, Integer, String, Boolean, create_engine, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'taskify.db')
DATABASE_URL = f"sqlite:///{DB_PATH}"

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
    due_date = Column(String, nullable=True)
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
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'owner_id': self.owner_id
        }

def init_db():
    Base.metadata.create_all(bind=engine)

def get_session():
    return SessionLocal()
