from flask import Flask, request, jsonify
from flask_cors import CORS
from models import init_db, get_session, User, Task
from sqlalchemy import select
from werkzeug.security import generate_password_hash, check_password_hash
import os
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

@app.route('/')
def home():
    return jsonify({'message':'Taskify backend running'})

# Auth endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username','').strip()
    password = data.get('password','').strip()
    if not username or not password:
        return jsonify({'error':'username and password required'}), 400
    with get_session() as s:
        existing = s.execute(select(User).filter_by(username=username)).scalars().first()
        if existing:
            return jsonify({'error':'username taken'}), 400
        user = User(username=username, password_hash=generate_password_hash(password))
        s.add(user); s.commit()
        return jsonify({'msg':'user created','user': user.to_dict()}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username','').strip()
    password = data.get('password','').strip()
    with get_session() as s:
        user = s.execute(select(User).filter_by(username=username)).scalars().first()
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error':'invalid credentials'}), 401
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
        title = data.get('title','').strip()
        if not title:
            return jsonify({'error':'title required'}), 400
        
        priority = data.get('priority','medium')
        due_date = data.get('due_date')
        category = data.get('category')
        
        with get_session() as s:
            t = Task(title=title, completed=False, priority=priority, due_date=due_date, category=category, owner_id=user.id)
            s.add(t)
            s.commit()
            return jsonify(t.to_dict()), 201
    except Exception as e:
        print(f"Error creating task: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    data = request.get_json() or {}
    with get_session() as s:
        t = s.get(Task, task_id)
        if not t or t.owner_id != user.id:
            return jsonify({'error':'not found'}), 404
        t.title = data.get('title', t.title)
        t.completed = data.get('completed', t.completed)
        t.priority = data.get('priority', t.priority)
        t.due_date = data.get('due_date', t.due_date)
        t.category = data.get('category', t.category)
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
