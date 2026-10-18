import base64
import json
import sys
import time
import urllib.request

import websocket

HASH = sys.argv[1] if len(sys.argv) > 1 else '#/setting'
OUT = sys.argv[2] if len(sys.argv) > 2 else r'D:\MaoMusic\.workbuddy-ai\cdp-shot.png'
WAIT = float(sys.argv[3]) if len(sys.argv) > 3 else 6.0
JS = sys.argv[4] if len(sys.argv) > 4 else ''


def targets():
    with urllib.request.urlopen('http://127.0.0.1:9222/json', timeout=5) as resp:
        return json.loads(resp.read().decode('utf-8'))


page = next(item for item in targets() if item.get('type') == 'page')
ws = websocket.create_connection(page['webSocketDebuggerUrl'], timeout=30, suppress_origin=True)
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
send('Page.enable')

evaluate("""
(() => {
  const btns = [...document.querySelectorAll('button')]
  const hit = btns.find(b => ['我知道了', '确定'].includes(b.textContent.trim()))
  if (hit) hit.click()
  return true
})()
""")

time.sleep(12)
evaluate("location.hash = %s" % json.dumps(HASH))
time.sleep(WAIT)

if JS:
    print('js:', evaluate(JS).get('result', {}).get('result', {}).get('value'))
    time.sleep(1.0)

data = send('Page.captureScreenshot', {'format': 'png'})['result']['data']
with open(OUT, 'wb') as fp:
    fp.write(base64.b64decode(data))

state = evaluate("""
JSON.stringify({
  hash: location.hash,
  rows: document.querySelectorAll('nav button').length,
  switches: document.querySelectorAll('button[role=switch]').length,
  checks: document.querySelectorAll('label input[type=radio], label input[type=checkbox]').length,
  scrollH: document.documentElement.scrollHeight
})
""")
print('state:', state.get('result', {}).get('result', {}).get('value'))
print('saved', OUT)
ws.close()
