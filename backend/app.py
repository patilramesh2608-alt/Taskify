from flask import Flask, request, jsonify
from flask_cors import CORS
from models import init_db, get_session, User, Task
from sqlalchemy import select
from werkzeug.security import generate_password_hash, check_password_hash
import os
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'devkey')
CORS(app)

init_db()

# Helper function to get current user from request
def get_current_user():
    username = request.headers.get('X-Username')
    if not username:
        return None
    with get_session() as s:
        user = s.execute(select(User).filter_by(username=username)).scalars().first()
        return user

# Validation helper functions
def validate_username(username):
    """Validate username format and length"""
    if not username or not username.strip():
        return False, 'Username is required'
    username = username.strip()
    if len(username) < 3:
        return False, 'Username must be at least 3 characters long'
    if len(username) > 50:
        return False, 'Username must be less than 50 characters'
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, 'Username can only contain letters, numbers, and underscores'
    return True, username

def validate_password(password):
    """Validate password"""
    if not password or not password.strip():
        return False, 'Password is required'
    password = password.strip()
    if len(password) < 6:
        return False, 'Password must be at least 6 characters long'
    if len(password) > 100:
        return False, 'Password must be less than 100 characters'
    return True, password

def validate_task_title(title):
    """Validate task title"""
    if not title or not title.strip():
        return False, 'Task title is required'
    title = title.strip()
    if len(title) > 200:
        return False, 'Task title must be less than 200 characters'
    return True, title

def validate_priority(priority):
    """Validate priority value"""
    valid_priorities = ['low', 'medium', 'high']
    if priority and priority not in valid_priorities:
        return False, f'Priority must be one of: {", ".join(valid_priorities)}'
    return True, priority or 'medium'

def validate_category(category):
    """Validate category"""
    if category:
        category = category.strip()
        if len(category) > 50:
            return False, 'Category must be less than 50 characters'
        return True, category
    return True, None

def validate_due_date(due_date):
    """Validate due date format"""
    if not due_date:
        return True, None
    try:
        # Try to parse the date string (expected format: YYYY-MM-DD)
        datetime.strptime(due_date, '%Y-%m-%d')
        return True, due_date
    except (ValueError, TypeError):
        return False, 'Invalid date format. Use YYYY-MM-DD format'

@app.route('/')
def home():
    return jsonify({'message':'Taskify backend running'})

# Auth endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400
    
    data = request.get_json() or {}
    username = data.get('username', '')
    password = data.get('password', '')
    
    # Validate username
    is_valid, result = validate_username(username)
    if not is_valid:
        return jsonify({'error': result}), 400
    username = result
    
    # Validate password
    is_valid, result = validate_password(password)
    if not is_valid:
        return jsonify({'error': result}), 400
    password = result
    
    # Check if username already exists
    with get_session() as s:
        existing = s.execute(select(User).filter_by(username=username)).scalars().first()
        if existing:
            return jsonify({'error': 'Username is already taken'}), 400
        
        user = User(username=username, password_hash=generate_password_hash(password))
        s.add(user)
        s.commit()
        return jsonify({'msg': 'user created', 'user': user.to_dict()}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400
    
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    # Validate that username and password are provided
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    
    with get_session() as s:
        user = s.execute(select(User).filter_by(username=username)).scalars().first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        return jsonify({'user': user.to_dict()})

# Tasks endpoints
@app.route('/api/tasks', methods=['GET'])
def list_tasks():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    with get_session() as s:
        tasks = s.execute(select(Task).filter_by(owner_id=user.id)).scalars().all()
        return jsonify([t.to_dict() for t in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json() or {}
        
        # Validate title
        title = data.get('title', '')
        is_valid, result = validate_task_title(title)
        if not is_valid:
            return jsonify({'error': result}), 400
        title = result
        
        # Validate priority
        priority = data.get('priority', 'medium')
        is_valid, result = validate_priority(priority)
        if not is_valid:
            return jsonify({'error': result}), 400
        priority = result
        
        # Validate due_date
        due_date = data.get('due_date')
        is_valid, result = validate_due_date(due_date)
        if not is_valid:
            return jsonify({'error': result}), 400
        due_date = result
        
        # Validate category
        category = data.get('category')
        is_valid, result = validate_category(category)
        if not is_valid:
            return jsonify({'error': result}), 400
        category = result
        
        with get_session() as s:
            t = Task(title=title, completed=False, priority=priority, due_date=due_date, category=category, owner_id=user.id)
            s.add(t)
            s.commit()
            return jsonify(t.to_dict()), 201
    except Exception as e:
        print(f"Error creating task: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400
    
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.get_json() or {}
    
    with get_session() as s:
        t = s.get(Task, task_id)
        if not t or t.owner_id != user.id:
            return jsonify({'error': 'Task not found'}), 404
        
        # Validate and update title if provided
        if 'title' in data:
            is_valid, result = validate_task_title(data.get('title', ''))
            if not is_valid:
                return jsonify({'error': result}), 400
            t.title = result
        
        # Validate and update completed status if provided
        if 'completed' in data:
            completed = data.get('completed')
            if not isinstance(completed, bool):
                return jsonify({'error': 'Completed must be a boolean value'}), 400
            t.completed = completed
        
        # Validate and update priority if provided
        if 'priority' in data:
            is_valid, result = validate_priority(data.get('priority'))
            if not is_valid:
                return jsonify({'error': result}), 400
            t.priority = result
        
        # Validate and update due_date if provided
        if 'due_date' in data:
            due_date = data.get('due_date')
            is_valid, result = validate_due_date(due_date)
            if not is_valid:
                return jsonify({'error': result}), 400
            t.due_date = result
        
        # Validate and update category if provided
        if 'category' in data:
            is_valid, result = validate_category(data.get('category'))
            if not is_valid:
                return jsonify({'error': result}), 400
            t.category = result
        
        s.commit()
        return jsonify(t.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    with get_session() as s:
        t = s.get(Task, task_id)
        if not t or t.owner_id != user.id:
            return jsonify({'error':'not found'}), 404
        s.delete(t); s.commit()
        return jsonify({'deleted': True})

if __name__ == '__main__':
    app.run(debug=True)
