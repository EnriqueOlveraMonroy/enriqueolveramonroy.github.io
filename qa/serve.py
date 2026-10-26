from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

class PreviewServer(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True

root = Path(__file__).resolve().parent.parent
server = PreviewServer(("127.0.0.1", 8000), partial(SimpleHTTPRequestHandler, directory=str(root)))
print("Portfolio preview: http://127.0.0.1:8000/ (Ctrl+C to stop)", flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
