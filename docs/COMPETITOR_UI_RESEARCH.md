# Competitor and UI research

**Reviewed:** 14 October 2026. Research used publicly accessible documentation, product pages, and pricing information. Authenticated customer dashboards were not available for direct inspection; UI notes below distinguish public evidence from design inference.

## Comparable products

| Product | Public workflow and positioning | Strengths | Gaps/opportunity for this MVP |
| --- | --- | --- | --- |
| GitHub Secret Scanning | Alerts are presented in repository Security and quality views; docs describe filtering, provider patterns, custom patterns, validity checks, and remediation. Public repositories get scanning at no charge; private organization access is plan-dependent. | Close to the repository workflow; push protection can prevent a leak before it lands; provider ecosystem. | Repository-hosted workflow and plan/access conditions do not serve every local, ad hoc scan; the interface may be more than a one-project first check needs. |
| Gitleaks | Open-source CLI scans files/repositories and Git history, supports config and report outputs. | Local operation, history coverage, configurable rules, automation formats. | CLI setup and report interpretation can be more technical for a first-time or non-specialist user. |
| TruffleHog | Free open-source scanner plus enterprise dashboard. Public enterprise docs describe summary metrics, live-secret status, source/type views, filtering, triage, rotation guidance, and analytics. The CLI supports multiple sources and optional validity verification. | Broad source coverage, verification, and large-scale remediation workflows. | Enterprise breadth and setup exceed the needs of a quick local visual check; verification can contact credential providers. |
| GitGuardian | SaaS platform with internal/public monitoring, developer endpoint protection, remediation playbooks, and multiple dashboards; its pricing page lists a bounded free tier and contact-sales higher tiers. | Polished unified secrets and identity workflows, team collaboration, alerts, integrations, and managed remediation. | Cloud/team platform assumes a broader workflow and data integration; a privacy-first offline check offers a different convenience trade-off rather than comparable detection coverage. |

## Useful public interface patterns

- **A clear navigation model:** GitHub centralizes repository security results in an established Security area; GitGuardian documents separate but visually similar dashboards for distinct workflows.
- **Actionable triage:** GitHub recommends credential rotation after an alert. TruffleHog exposes state filters and links dashboard totals to filtered result lists; its documentation separates confirmed-live secrets from unverified findings.
- **Context without clutter:** Enterprise interfaces lead with summary counts and let users drill into the underlying result list. This is useful for teams, but the MVP avoids fabricated trend charts and uses only counts derived from the current scan.
- **Pricing/access transparency:** GitHub docs explain public versus private availability; vendor pricing pages distinguish free limits and sales-led plans. Local Secret Review has no account or pricing gate.
- **Trust communication:** Explain whether a match was verified, show remediation steps, and state what is excluded. Local Secret Review always labels rule confidence and says it cannot establish that a credential is active.

## Design decisions for Local Secret Review

The app uses an original compact workspace layout with a visible local-only statement, a single primary scan action, true post-scan counts, severity-coded findings, search/filter controls, and safe export. There are no customer counts, demo scans, trend charts, or “protected” claims. The findings table shows path and line, detector, confidence, and remediation while keeping matched text hidden. A separate guide explains privacy, limits, and how to interpret a clean scan.

Responsive behavior changes the desktop sidebar into a horizontal navigation row and stacks the scan panel on narrow screens. Semantic headings, labels, focus styling, status announcements, and `textContent` rendering support accessibility and safe handling of untrusted file paths.

## Selected style direction

The selected public reference is [GitHub Code Security](https://github.com/security/advanced-security/code-security). The redesign adopts a repository-oriented hierarchy, compact navigation, a workspace breadcrumb, clear security summaries, flat bordered panels, green action buttons, and blue links. These patterns are adapted to an offline folder scan, not to a GitHub-connected workflow. The shield-and-check mark in assets/mark.svg is an original Local Secret Review logo. Scanner behavior and privacy boundaries remain unchanged.
## Sources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning) and [GitHub Advanced Security billing](https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security).
- [Gitleaks official repository](https://github.com/gitleaks/gitleaks).
- [TruffleHog pricing](https://trufflesecurity.com/pricing), [user enablement guide](https://trufflesecurity.com/docs/user-enablement-guide), and [CLI documentation](https://github.com/trufflesecurity/trufflehog/blob/main/docs/man/trufflehog.1).
- [GitGuardian pricing](https://www.gitguardian.com/pricing) and [plan usage](https://docs.gitguardian.com/platform/user-account/plan-usage).

All checked on 14 October 2026. Pricing and feature availability may change; use the vendor pages for current details.
