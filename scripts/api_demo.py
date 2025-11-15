import json
import urllib.request as u

BASE = 'http://127.0.0.1:5000'

def post(path, data, headers=None):
    req = u.Request(BASE+path, data=json.dumps(data).encode(), headers={'Content-Type':'application/json', **(headers or {})})
    with u.urlopen(req) as r:
        return r.read().decode()

def get(path, headers=None):
    req = u.Request(BASE+path, headers=headers or {})
    with u.urlopen(req) as r:
        return r.read().decode()

def main():
    print('Registering user ci_user...')
    try:
        res = post('/auth/register', {'username':'ci_user','password':'secret123'})
        print('REGISTER RESPONSE:', res)
    except Exception as e:
        print('Register failed (may already exist):', e)

    print('\nCreating a task for ci_user...')
    try:
        headers = {'X-Username':'ci_user'}
        task = {'title':'Demo task from api_demo','priority':'high','due_date':'2025-12-15','category':'Demo'}
        req = u.Request(BASE+'/api/tasks', data=json.dumps(task).encode(), headers={'Content-Type':'application/json', **headers})
        with u.urlopen(req) as r:
            print('CREATE RESPONSE:', r.read().decode())
    except Exception as e:
        print('Create failed:', e)

    print('\nListing tasks for ci_user...')
    try:
        req = u.Request(BASE+'/api/tasks', headers={'X-Username':'ci_user'})
        with u.urlopen(req) as r:
            print('LIST RESPONSE:', r.read().decode())
    except Exception as e:
        print('List failed:', e)

if __name__ == '__main__':
    main()
