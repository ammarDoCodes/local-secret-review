# Requirements

## Scope

Local Secret Review is a local-only working-tree helper. It is not an authenticated multi-user service, hosted scanner, or authoritative security verdict.

## Functional requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| FR-01 | Select a local project folder in a supported browser. | The browser exposes the chosen files to the page only after user selection; no path-only server API exists. |
| FR-02 | Scan supported files with documented secret-pattern rules. | Each finding has a detector, severity, relative path, and one-based line. |
| FR-03 | Keep matched credential values out of application output. | Results, page text, CSV, and server logs do not include matched values. |
| FR-04 | Bound scan work and explain skipped files. | The app applies 5,000-file, 1 MiB/file, 50 MiB-total limits and reports skip/read counts. |
| FR-05 | Search and filter findings. | Path, detector, and severity can be narrowed without changing the underlying result set. |
| FR-06 | Mark findings reviewed for the current session. | The reviewed state is visible and is not persisted after a reload. |
| FR-07 | Export a redacted CSV report. | CSV columns are stable; values are properly quoted and formula-leading values are neutralized; no matched value is included. |
| FR-08 | Serve the UI locally with safe defaults. | Server binds to 127.0.0.1, serves only page/assets, accepts GET/HEAD, rejects unknown Host headers, and sets restrictive browser headers. |
| FR-09 | Explain meaning, remediation, and limitations. | Guidance states rotation/revocation actions and that pattern coverage is incomplete. |

## Nonfunctional requirements

- **Privacy:** No network service receives file contents. No scan state is stored server-side or in browser storage.
- **Security:** Render untrusted paths as text; avoid raw secret values in findings/logs/reports; restrict static server surface; use CSP and standard hardening headers.
- **Resource use:** Apply stated file-count/size caps and yield to the browser between batches.
- **Accessibility:** Semantic headings, keyboard-operable controls, visible focus, labels, status announcements, and responsive layouts.
- **Maintainability:** Plain browser modules and Python standard library; no runtime package dependencies.
- **Reliability:** File read errors and skips are counted; no “clean” result is presented as proof of absence.
- **Compatibility:** Current Chromium with directory selection; Python 3.10+ to serve. Other browser folder-picker behavior is not validated.

## User stories

1. As a developer, I want to scan a local project before sharing it so that common credential patterns are easier to catch.
2. As a reviewer, I want findings to show where to inspect and what to do without revealing the matched value again.
3. As a small team member, I want a portable report with file/line metadata so I can track follow-up without sending source code to a service.
4. As a non-specialist, I want clear limitations so I do not confuse a heuristic result with a security guarantee.

## Data and API requirements

There is no backend API, account, database, or persistent scan record. Browser `File` objects are read in memory after user selection. In-memory result objects contain rule metadata, relative path, line, severity, confidence, and remediation text only. Optional CSV export includes this metadata. There are no credentials or environment variables.

## Authorization and retention

Authorization is supplied by the local user's folder selection. There is no remote user, role, or access-control model. The server is bound to loopback and serves only static assets. Review status lasts only for the current page session. The CSV is controlled by the user's browser download flow.

## Verification requirements

Unit tests cover supported formats, placeholders, source line numbers, secret-value redaction, ignored folders, and self-scan behavior. Python tests cover loopback binding, headers, Host validation, method restrictions, and static-file allowlisting. Browser checks cover page loading, navigation, and responsive widths. Folder-picker E2E automation remains unverified because the in-app browser did not expose its native file chooser.
