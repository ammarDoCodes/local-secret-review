"""Serve the static, local-only app on the loopback interface."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent
PUBLIC_ASSETS = {"app.css", "app.js", "scanner.js", "report.js", "mark.svg"}


class LocalOnlyServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class Handler(SimpleHTTPRequestHandler):
    server_version = "LocalSecretReview"
    sys_version = ""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def parse_request(self):
        if not super().parse_request():
            return False
        allowed_hosts = {
            f"127.0.0.1:{self.server.server_port}",
            f"localhost:{self.server.server_port}",
            "127.0.0.1",
            "localhost",
        }
        if self.headers.get("Host", "") not in allowed_hosts:
            self.send_error(400, "Use the local address printed by the server")
            return False
        if self.command not in {"GET", "HEAD"}:
            self.send_error(405, "Method not allowed")
            return False
        return True

    def translate_path(self, path):
        request_path = unquote(urlsplit(path).path)
        if request_path in {"/", "/index.html"}:
            return str(ROOT / "index.html")
        parts = Path(request_path.lstrip("/")).parts
        if len(parts) == 2 and parts[0] == "assets" and parts[1] in PUBLIC_ASSETS:
            return str(ROOT / "assets" / parts[1])
        return str(ROOT / "__not_found_static_asset__")

    def end_headers(self):
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        self.send_error(405, "Method not allowed")

    def do_PUT(self):
        self.send_error(405, "Method not allowed")

    def do_DELETE(self):
        self.send_error(405, "Method not allowed")

    def log_message(self, format, *args):
        # Avoid logging request query strings or user-supplied file data.
        super().log_message("%s %s", self.command, self.path.split("?", 1)[0])


def main():
    parser = argparse.ArgumentParser(description="Run Local Secret Review on this computer only.")
    parser.add_argument("--port", type=int, default=9000, help="local port (default: 9000)")
    args = parser.parse_args()
    server = LocalOnlyServer(("127.0.0.1", args.port), Handler)
    print(f"Local Secret Review is ready at http://127.0.0.1:{server.server_port}/")
    print("This server is bound to this computer only. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
