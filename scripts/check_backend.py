import time
import urllib.request as u

def main():
    for i in range(15):
        try:
            resp = u.urlopen('http://127.0.0.1:5000/').read().decode()
            print(resp)
            return 0
        except Exception:
            time.sleep(1)
    print('FAILED')
    return 1

if __name__ == '__main__':
    raise SystemExit(main())
