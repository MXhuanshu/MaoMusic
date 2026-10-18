import json
import sys
import time
import urllib.request

import websocket

pages = [t for t in json.loads(urllib.request.urlopen('http://127.0.0.1:9222/json', timeout=5).read()) if t.get('type') == 'page']
ws = websocket.create_connection(pages[0]['webSocketDebuggerUrl'], timeout=30, suppress_origin=True)
msg_id = 0


def send(method, params=None):
    global msg_id
    msg_id += 1
    ws.send(json.dumps({'id': msg_id, 'method': method, 'params': params or {}}))
    while True:
        data = json.loads(ws.recv())
        if data.get('id') == msg_id:
            return data


def evaluate(expression):
    return send('Runtime.evaluate', {'expression': expression, 'returnByValue': True})


send('Runtime.enable')
errors = []


def drain():
    ws.settimeout(0.4)
    while True:
        try:
            data = json.loads(ws.recv())
        except Exception:
            break
        if data.get('method') == 'Runtime.exceptionThrown':
            exception = data['params']['exceptionDetails']
            text = exception.get('exception', {}).get('description') or exception.get('text', '')
            errors.append(text.split('\n')[0])


HASH = sys.argv[1] if len(sys.argv) > 1 else '#/setting'
drain()
evaluate("location.hash = %s" % json.dumps(HASH))
time.sleep(5)
drain()
evaluate("location.hash = '#/search'")
time.sleep(4)
drain()
evaluate("location.hash = %s" % json.dumps(HASH))
time.sleep(5)
drain()

print('== errors ==')
for line in errors[:6]:
    print('-', line[:200])
print('total:', len(errors))
