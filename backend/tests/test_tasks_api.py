import json
import os
import sys
import importlib
import pytest


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Use an isolated temporary SQLite DB for tests
    db_file = tmp_path / "test_taskify.db"
    db_url = f"sqlite:///{db_file}"
    monkeypatch.setenv('TASKIFY_DATABASE_URL', db_url)

    # Ensure backend package dir is importable
    ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if ROOT not in sys.path:
        sys.path.insert(0, ROOT)

    # Import app after setting env so models picks up TASKIFY_DATABASE_URL
    # If already imported (e.g., pytest re-use), reload to pick up env change
    if 'app' in sys.modules:
        importlib.reload(sys.modules['app'])
    else:
        import app

    import app as app_module

    app = app_module.app
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def ensure_user(client, username='pytest_user'):
    # Register user in the isolated test DB
    return client.post('/auth/register', json={'username': username, 'password': 'testpass'})


def test_create_task_with_due_date_and_list(client):
    username = 'pytest_user'
    ensure_user(client, username)

    payload = {
        'title': 'API test task',
        'priority': 'high',
        'due_date': '2025-12-01',
        'category': 'Test'
    }

    # Create task
    res = client.post('/api/tasks', json=payload, headers={'X-Username': username})
    assert res.status_code == 201, f"Create failed: {res.status_code} {res.data}"
    created = res.get_json()
    assert 'dueDate' in created
    # dueDate should include the date string (ISO or YYYY-MM-DD)
    assert str(created['dueDate']).startswith('2025-12-01')

    # List tasks and ensure at least one has dueDate
    res2 = client.get('/api/tasks', headers={'X-Username': username})
    assert res2.status_code == 200
    tasks = res2.get_json()
    assert isinstance(tasks, list) and len(tasks) >= 1
    found = False
    for t in tasks:
        if t.get('title') == payload['title'] and t.get('dueDate'):
            found = True
            # cleanup: delete this task
            client.delete(f"/api/tasks/{t['id']}", headers={'X-Username': username})
            break
    assert found, 'Created task with dueDate not found in list'


def test_create_task_invalid_due_date(client):
    username = 'pytest_user2'
    ensure_user(client, username)

    payload = {
        'title': 'Invalid date task',
        'priority': 'low',
        'due_date': '2025-13-01',  # invalid month
        'category': 'Test'
    }

    res = client.post('/api/tasks', json=payload, headers={'X-Username': username})
    assert res.status_code == 400
    data = res.get_json()
    assert data is not None
    assert 'error' in data
    assert 'Invalid date format' in data['error']


def test_update_task_due_date(client):
    username = 'pytest_user3'
    ensure_user(client, username)

    # create initial task without due date
    payload = {
        'title': 'Update date task',
        'priority': 'medium',
        'due_date': None,
        'category': 'Test'
    }
    res = client.post('/api/tasks', json=payload, headers={'X-Username': username})
    assert res.status_code == 201
    created = res.get_json()
    tid = created['id']

    # update due_date
    patch = {'due_date': '2026-01-15'}
    res2 = client.put(f'/api/tasks/{tid}', json=patch, headers={'X-Username': username})
    assert res2.status_code == 200
    updated = res2.get_json()
    assert 'dueDate' in updated
    assert str(updated['dueDate']).startswith('2026-01-15')

    # fetch list and ensure update persisted
    res3 = client.get('/api/tasks', headers={'X-Username': username})
    assert res3.status_code == 200
    tasks = res3.get_json()
    found = False
    for t in tasks:
        if t.get('id') == tid:
            found = True
            assert str(t.get('dueDate')).startswith('2026-01-15')
            # cleanup
            client.delete(f'/api/tasks/{tid}', headers={'X-Username': username})
            break
    assert found
