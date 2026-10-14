# Threat model

## Scope and assumptions

The threat model covers the static page, scanner, user-selected local files, CSV export, and loopback server. The user is operating their own trusted browser on their own device. The server is not intended for LAN or internet exposure. Local malware, a malicious browser extension, operating-system compromise, and theft of a downloaded report are outside the product's control.

## Assets and attack surfaces

**Assets:** source file contents and embedded credentials, finding metadata, local project paths, and downloaded CSV reports.

**Attack surfaces:** browser File API, path/content text rendered in DOM, fixed regex processing, local HTTP server, Host header, static file path resolution, CSV cells, and outbound guidance link.

## STRIDE analysis

| Threat | Example | Mitigation | Residual risk |
| --- | --- | --- | --- |
| Spoofing | A website uses a rebinding hostname to reach the local server. | Bind only to `127.0.0.1`; accept only `localhost` or loopback Host values; no data or action API exists. | A compromised local browser or extension can observe local page activity. |
| Tampering | A request tries to alter scan state or overwrite a local file. | Server accepts only GET/HEAD; there is no scan or write endpoint; static allowlist; restrictive CSP. | The user may edit local source files directly, which is expected for a local project. |
| Repudiation | A user cannot reconstruct prior scan actions. | The tool deliberately stores no audit log or scan history. | No durable review evidence is kept; this is not a compliance system. |
| Information disclosure | A matched secret appears in a page, log, or report. | Findings contain metadata only; DOM uses `textContent`; server never receives file contents; CSV excludes matches; no app persistence. | Browser extensions, screen capture, OS malware, or user-selected export handling can expose data. |
| Denial of service | A huge project or crafted text stalls the page. | File count/size/total limits, binary skip, simple fixed regex rules, and periodic event-loop yields. | A near-limit scan can still consume memory and make a low-powered browser temporarily busy. |
| Elevation of privilege | A remote caller uses the local server to read arbitrary files. | Loopback binding, strict Host checks, no user-controlled filesystem route, and static path allowlist. | The static app runs in the user's browser security context; browser vulnerabilities are out of scope. |

## Security requirements

- Do not upload selected content or include matched values in output.
- Treat paths and file contents as untrusted input.
- Bound file count and bytes per scan.
- Do not expose arbitrary local file paths through the server.
- Make no state-changing server routes.
- Keep limitations and remediation guidance visible.

## Validation performed

Automated tests verify redaction, pattern matching, skip behavior, local server binding, Host rejection, method rejection, response headers, and static file allowlisting. Source review checks data flow and use of safe DOM APIs. The in-app browser verified the page, navigation, and desktop/mobile overflow. Native folder selection could not be exercised in that browser automation session, so full file-picker workflow remains a manual check.
