# Security policy

## Product scope

Local Secret Review is a local heuristic aid. It is not a security scanner with comprehensive provider coverage and does not verify whether a credential is active. False positives and missed secrets are possible.

## Reporting an issue

Do not submit real credentials, private source files, or exploit payloads containing sensitive data in a public issue. Use synthetic examples that preserve the relevant format. If this project is hosted on GitHub, use its private security reporting feature where available; otherwise contact the repository owner through a private channel.

There is no published response-time commitment. Rotate any credential that may have been exposed before investigating how it entered a repository.

## Safe use

Only select folders you are authorized to review. The app reads files selected through the browser's local folder picker and displays metadata about matching lines; it does not upload the contents. The CSV report contains paths and findings metadata and should still be treated as internal project information.
