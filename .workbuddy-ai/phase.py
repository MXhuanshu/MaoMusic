import json
import time
import urllib.request

import websocket

A = '#/setting'
B = '#/search'

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
    ws.settimeout(0.35)
    while True:
        try:
            data = json.loads(ws.recv())
        except Exception:
            break
        if data.get('method') == 'Runtime.exceptionThrown':
            details = data['params']['exceptionDetails']
            errors.append((details.get('exception', {}).get('description') or details.get('text', '')).split('\n')[0])


# 起点：A
evaluate("location.hash = %s" % json.dumps(A))
time.sleep(4)
drain()
print('A enter   :', len(errors))
n_a = len(errors)

# A -> B
evaluate("location.hash = %s" % json.dumps(B))
time.sleep(4)
drain()
print('A->B      :', len(errors) - n_a)
n_b = len(errors)

# B -> A
evaluate("location.hash = %s" % json.dumps(A))
time.sleep(4)
drain()
print('B->A      :', len(errors) - n_b)
n_c = len(errors)

# A -> A (原地刷新 query)
evaluate("location.hash = %s" % json.dumps(A + '?x=1'))
time.sleep(3)
drain()
print('A->A(query):', len(errors) - n_c)

for line in errors[:4]:
    print('  -', line[:150])
