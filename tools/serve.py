# -*- coding: utf-8 -*-
"""Lokalni server bez keširanja:  python tools/serve.py [port]"""
import os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5220

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()
    def log_message(self, *a):
        pass

if __name__ == '__main__':
    print(f'http://localhost:{PORT}')
    ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
