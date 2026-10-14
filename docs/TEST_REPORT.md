# Test report

**Executed:** 14 October 2026 on Windows, workspace `M:\Project 4`. These results describe only commands actually run.

## Automated checks

| Test | Purpose | Execution | Expected | Actual | Status / evidence |
| --- | --- | --- | --- | --- | --- |
| Secret-pattern and report tests | Check provider-like identifiers, private-key marker, assignment heuristic, placeholders, path exclusions, line numbers, redaction, CSV quoting, and spreadsheet formula neutralization. | `npm test` (Node v24.18.0; built-in test runner) | Each synthetic fixture has expected metadata; matched values stay absent from output. | 11 tests passed, 0 failed. | **Pass** |
| Project self-scan | Scan text source and documentation using this product's own rule set. | Included in `npm test` | No accidental matches in this project. | 0 findings; one earlier false positive from a short quoted test example was fixed by excluding quote characters from the unquoted-value pattern. | **Pass after fix** |
| Local server tests | Check loopback bind, page response, security headers, Host rejection, method restriction, path allowlist, and required assets. | `python -m unittest discover -s tests -p 'test_*.py' -v` (Python 3.13.7) | Expected 200/400/404/405 responses and headers. | 6 tests passed, 0 failed. | **Pass** |
| JavaScript syntax | Parse scanner, report serializer, and UI modules. | `node --check assets/scanner.js`, `node --check assets/report.js`, `node --check assets/app.js` | No syntax errors. | All three commands exited 0. | **Pass** |
| Python syntax | Parse local server. | `python -m py_compile serve.py` | No syntax errors. | Exited 0. | **Pass** |
| Dependency inventory | Confirm no added npm runtime packages. | `npm ls --depth=0` | Empty dependency tree. | Empty dependency tree. | **Pass** |

## Browser smoke checks

| Check | Method | Result |
| --- | --- | --- |
| Default launch | Ran `python serve.py`; opened the printed `127.0.0.1:9000` address. | Page and bundled assets loaded. |
| Navigation and empty state | Opened How it works and Findings in the in-app Chromium browser. | Headings, privacy notes, limits, filters, and empty state appeared. |
| Console | Read browser console after the pages loaded. | No console messages were returned. |
| Icons and light/dark themes | Reloaded the app, inspected SVG icons, switched themes with the header control, and refreshed. | Both palettes render on Overview and Findings; the accessible toggle updates its state and the dark preference persisted after refresh. |
| Desktop responsive width | Browser viewport check before the redesign; the refreshed overview was visually inspected at the current desktop viewport. | Historical measurement was 1280 × 900 with no horizontal overflow; post-redesign dimensions were not measured. |
| Mobile responsive width | Browser viewport override before the redesign. | Historical measurement was 390 × 844 with no horizontal overflow; mobile appearance after the redesign was not remeasured. |
| Folder selection and live scan | Attempted the native directory picker using the in-app browser automation. | The automation did not expose a file-chooser event, so an end-to-end scan through the browser UI could not be verified in this environment. Scanner behavior is covered by Node fixtures; users should perform one manual scan after launch. |
| Browser CSV download | No scan was available in the browser session, so download behavior was not exercised. | Serializer logic and formula-neutralization are unit-tested; actual browser download remains unverified. |

## Result and limits

All executed automated tests and syntax checks passed after remediation. The focused browser smoke check supports the page, navigation, and responsive layout. File-picker integration, live scan display, review toggling, and browser download still need a manual end-to-end check. No external DAST or commercial SAST scanner was installed or run. The project self-scan only checks this product's six narrow rules and cannot establish that no secrets exist.
