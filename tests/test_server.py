import threading
import unittest
import urllib.error
import urllib.request

from serve import Handler, LocalOnlyServer


class LocalServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = LocalOnlyServer(("127.0.0.1", 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.server.server_port}/"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def test_binds_to_loopback_and_serves_app(self):
        self.assertEqual(self.server.server_address[0], "127.0.0.1")
        with urllib.request.urlopen(self.url, timeout=2) as response:
            body = response.read().decode("utf-8")
            self.assertEqual(response.status, 200)
            self.assertIn("Local Secret Review", body)

    def test_sets_restrictive_browser_headers(self):
        with urllib.request.urlopen(self.url, timeout=2) as response:
            headers = response.headers
            self.assertIn("default-src 'self'", headers["Content-Security-Policy"])
            self.assertEqual(headers["X-Content-Type-Options"], "nosniff")
            self.assertEqual(headers["X-Frame-Options"], "DENY")
            self.assertEqual(headers["Referrer-Policy"], "no-referrer")
            self.assertEqual(headers["Cache-Control"], "no-store")
            self.assertIsNone(headers.get("Access-Control-Allow-Origin"))

    def test_rejects_untrusted_host_headers(self):
        request = urllib.request.Request(self.url, headers={"Host": "untrusted.example"})
        with self.assertRaises(urllib.error.HTTPError) as error:
            urllib.request.urlopen(request, timeout=2)
        self.assertEqual(error.exception.code, 400)

    def test_rejects_state_changing_methods(self):
        request = urllib.request.Request(self.url, data=b"not accepted", method="POST")
        with self.assertRaises(urllib.error.HTTPError) as error:
            urllib.request.urlopen(request, timeout=2)
        self.assertEqual(error.exception.code, 405)

    def test_only_serves_the_application_assets(self):
        for path in ("serve.py", "tests/test_server.py", "assets/../serve.py"):
            with self.subTest(path=path):
                with self.assertRaises(urllib.error.HTTPError) as error:
                    urllib.request.urlopen(self.url + path, timeout=2)
                self.assertEqual(error.exception.code, 404)

    def test_serves_named_application_assets(self):
        for path in ("assets/app.css", "assets/app.js", "assets/scanner.js", "assets/report.js", "assets/mark.svg"):
            with self.subTest(path=path):
                with urllib.request.urlopen(self.url + path, timeout=2) as response:
                    self.assertEqual(response.status, 200)


if __name__ == "__main__":
    unittest.main()
