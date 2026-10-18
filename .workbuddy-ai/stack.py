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
send('Log.enable')

# 注入栈捕获：Vue 内部抛错前先 tee 一把
evaluate("""
window.__errs = []
window.addEventListener('error', e => {
  window.__errs.push({ msg: e.message, stack: (e.error && e.error.stack || '').split('\\n').slice(0, 12).join(' | ') })
})
""")

evaluate("location.hash = '#/setting'")
time.sleep(4)
evaluate("location.hash = '#/search'")
time.sleep(3)
evaluate("location.hash = '#/setting'")
time.sleep(4)

result = evaluate("JSON.stringify(window.__errs.slice(0, 3), null, 1)")
print(result.get('result', {}).get('result', {}).get('value'))
