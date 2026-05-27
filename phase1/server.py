import http.server
import socketserver
import os
import json

PORT = 8000
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')

class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        # 1. API Health Check
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {"status": "ok", "phase": 1}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        # 2. Check if the path corresponds to a static file
        # strip query parameters/hash
        clean_path = self.path.split('?')[0].split('#')[0]
        local_path = os.path.join(PUBLIC_DIR, clean_path.lstrip('/'))

        if os.path.exists(local_path) and os.path.isfile(local_path):
            # Let SimpleHTTPRequestHandler serve the file normally
            super().do_GET()
        else:
            # 3. Fallback to index.html for SPA client-side routing
            self.path = '/index.html'
            super().do_GET()

    # Avoid logging every single asset request to keep output clean
    def log_message(self, format, *args):
        # Only log API calls or errors
        if "api" in format or any(x in str(args) for x in ["404", "500"]):
            super().log_message(format, *args)

if __name__ == '__main__':
    # Ensure public folder exists
    if not os.path.exists(PUBLIC_DIR):
        print(f"Creating public directory at {PUBLIC_DIR}")
        os.makedirs(PUBLIC_DIR)

    print(f"Starting server on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), SPAHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
