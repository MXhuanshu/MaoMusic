import json
import sys
import urllib.request

import websocket

pages = [t for t in json.loads(urllib.request.urlopen('http://127.0.0.1:9222/json', timeout=5).read()) if t.get('type') == 'page']
ws = websocket.create_connection(pages[0]['webSocketDebuggerUrl'], timeout=30, suppress_origin=True)
ws.send(json.dumps({'id': 1, 'method': 'Runtime.enable'}))
ws.send(json.dumps({'id': 2, 'method': 'Log.enable'}))

collected = []
while True:
    try:
        data = json.loads(ws.recv())
    except Exception:
        break
    if data.get('method') == 'Runtime.consoleAPICalled':
        for arg in data.get('params', {}).get('args', []):
            if arg.get('type') == 'string':
                collected.append(arg.get('value'))
    elif data.get('method') == 'Log.entryAdded':
        collected.append(data['params']['entry'].get('text', ''))
    if len(collected) > 40:
        break

for line in collected[:40]:
    print(line[:400])
