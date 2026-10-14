# Local Secret Review

A small, browser-based helper for checking a selected project folder for common credential patterns. The scan runs in the browser on your computer. The app has no upload endpoint, account, database, external scanning service, or third-party runtime dependency.

> A clean result is not proof that a repository contains no secrets. This is a narrow heuristic check, not a replacement for a maintained secret scanner or a security review.

## Run locally

Requirements: Python 3.10+ to serve the app, and a current Chromium browser such as Chrome or Edge with folder selection support. Node.js 20+ is needed only to run the JavaScript unit tests.

```powershell
python serve.py
```

Open the local address printed by the server (default `http://127.0.0.1:9000/`). The server listens on loopback only. Press `Ctrl+C` in the terminal to stop it.

No dependency installation or environment file is needed. For another port, run `python serve.py --port 9000`.

## Scan a project

1. Choose **Choose project folder** and select a local working tree.
2. Start **Run scan**.
3. Filter the results, mark findings reviewed for the current page session, and optionally export a CSV.
4. If a real credential was committed, revoke or rotate it with the issuing service. Removing a line from the latest working tree alone does not revoke it or remove it from Git history.

The CSV contains detector, severity, file path, line, review state, and remediation guidance. It never includes matched credential text. File paths can still disclose local project names, so treat exported reports as project metadata.

## What it checks

| Rule | Severity | Coverage |
| --- | --- | --- |
| Private-key marker | Critical | Common PEM private-key begin markers |
| GitHub access token | High | Selected `gh*` and fine-grained token prefixes |
| AWS access key identifier | High | `AKIA` identifier format |
| Google API key | High | `AIza` key format |
| Slack token | High | Common `xox*` token formats |
| Credential-like assignment | Medium | Named API key, secret, token, password, and private-key assignments; placeholder filtering and character-diversity heuristic |

## Scope and privacy

- Selected file contents are read with the browser File API and scanned in memory.
- The server serves only the application page and its five static assets; it accepts only `GET` and `HEAD` and rejects unrecognized Host headers.
- The app does not send selected file content or findings to the server, and it makes no automatic third-party requests.
- Review state exists only until the page is reloaded. The optional CSV is saved by your browser to your chosen download location.
- Current limits are 5,000 selected files, 1 MiB per file, and 50 MiB total. Common dependency/build folders, binary files, oversized files, and files beyond the limits are skipped and counted.
- `.git` is excluded. This checks the selected working tree, not Git history, remotes, ignored content hidden by the browser's folder picker, or provider validity.

For details, see [Security](SECURITY.md) and the [security audit](docs/SECURITY_AUDIT.md).

## Development and tests

The app uses plain HTML, CSS, browser JavaScript, and Python's standard library. There are no production npm packages.

```powershell
npm test
python -m unittest discover -s tests -p 'test_*.py' -v
node --check assets/scanner.js
node --check assets/app.js
python -m py_compile serve.py
```

## Project documentation

- [Market research and idea selection](docs/MARKET_RESEARCH.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Competitor and UI research](docs/COMPETITOR_UI_RESEARCH.md)
- [Test report](docs/TEST_REPORT.md)
- [Security audit](docs/SECURITY_AUDIT.md)
- [Remediation report](docs/REMEDIATION_REPORT.md)
- [Final QA report](docs/FINAL_QA_REPORT.md)
- [Implementation report](docs/IMPLEMENTATION_REPORT.md)
- [GitHub release report](docs/GITHUB_RELEASE_REPORT.md)

No license has been selected. Market demand is supported by industry threat reporting and existing product offerings, but this project has not been validated through customer interviews or willingness-to-pay research.
