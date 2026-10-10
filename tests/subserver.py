# Крошечный сервер «подписки» для тестов: base64-список ссылок + заголовки как у панелей.
import base64, http.server, sys
links = open(sys.argv[2], encoding="utf-8").read()
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        body = base64.b64encode(links.encode()).decode().encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Profile-Title", "base64:" + base64.b64encode("Тест".encode()).decode())
        self.send_header("Subscription-Userinfo", "upload=1048576; download=2097152; total=10737418240; expire=1893456000")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a): pass
http.server.HTTPServer(("127.0.0.1", int(sys.argv[1])), H).serve_forever()
