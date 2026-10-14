# Implementation plan

## Ordered work and status

| Step | Work | Status | Evidence / remaining work |
| --- | --- | --- | --- |
| 1 | Research market signals and compare at least five product ideas. | Complete | `MARKET_RESEARCH.md`; public primary sources linked; user demand not directly surveyed. |
| 2 | Define requirements, data handling, architecture, and threat model. | Complete | `REQUIREMENTS.md`, `ARCHITECTURE.md`, `THREAT_MODEL.md`. |
| 3 | Build the local browser application and secure loopback static server. | Complete | `index.html`, `assets/`, `serve.py`. |
| 4 | Add detector tests and server-boundary tests; review privacy, XSS, CSV, and resource limits. | Complete with limitation | Node and Python suites pass. Folder selection was not automatable in the in-app browser. |
| 5 | Compare public competitor workflows and create a responsive UI. | Complete | `COMPETITOR_UI_RESEARCH.md`; responsive viewport checks recorded in `TEST_REPORT.md`. |
| 6 | Final QA, traceability, documentation, and archive. | Complete | `FINAL_QA_REPORT.md`, `IMPLEMENTATION_REPORT.md`, `GITHUB_RELEASE_REPORT.md`, and root ZIP archive. |
| 7 | Create a private GitHub repository, commit, push, and verify. | Complete | Private visibility, main branch contents, and rendered README verified. See `GITHUB_RELEASE_REPORT.md`. |

## MVP implementation choices

- Use plain browser modules to keep source contents on-device and avoid runtime dependencies.
- Use Python's standard library only to serve static files and set browser security headers.
- Use heuristic rules with a narrow stated scope instead of claiming comprehensive detection.
- Exclude Git history, archives, remotes, and active credential validation from this MVP.
- Export only metadata, not matched content.

## Release gates

1. Automated tests pass and code compiles/parses.
2. Local server and headers are verified.
3. No critical/high implementation issue is known from the focused review.
4. Limitations and unverified browser file selection are clearly recorded.
5. No secrets or generated artifacts are included in the source archive.
6. GitHub status is reported only if repository visibility and remote contents can be verified.
