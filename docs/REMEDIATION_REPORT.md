# Remediation report

**Date:** 14 October 2026

| Issue / weakness | Severity | Remediation | Verification |
| --- | --- | --- | --- |
| A short quoted example in test code could be re-read as an unquoted credential assignment by the generic heuristic. | Low, false-positive quality issue | Excluded quote characters from the generic unquoted value branch. | Added project self-scan test; Node suite passes with 0 project matches. |
| A user-controlled file path beginning with spreadsheet formula syntax could become an active CSV cell. | Low | CSV serializer apostrophe-prefixes formula-leading values and escapes quotes. | Dedicated synthetic formula-path test passes. |
| Serving a directory with a generic static handler could expose non-UI source files to a local browser request. | Informational hardening item | Added exact path allowlist for the page and five assets; all other paths map to 404. | Python tests verify source/test paths and traversal probe return 404 and each asset returns 200. |
| Inline script conflicted with a strict content security policy. | Informational hardening item | Moved UI behavior into the external module and set `script-src 'self'` without `unsafe-inline`. | Browser smoke shows app loads; server response header tested. |
| Default port 8765/8766 was unavailable in this Windows environment after the initial preview session. | Operational | Changed default to 9000; kept a `--port` override and enabled address reuse for normal restarts. | `python serve.py` started and printed `http://127.0.0.1:9000/`. |

No Critical or High application finding was confirmed. The detector's incomplete pattern coverage and absent browser end-to-end validation are documented residual limitations, not represented as fixed vulnerabilities.
