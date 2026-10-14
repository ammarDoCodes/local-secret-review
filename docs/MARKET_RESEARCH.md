# Market research and product selection

**Research date:** 14 October 2026  
**Method:** Desk research of current breach reporting, official guidance, and public product documentation/pricing. No user survey, customer interview, or willingness-to-pay study was conducted.

## Market signals

Verizon's 2026 DBIR says 31% of breaches in its dataset began with vulnerability exploitation, and its SMB infographic reports more than 22,000 breaches across 145 countries. It also reports third-party involvement in 48% of breaches. This establishes a material security burden for small organizations, but it does not by itself show that local secret scanning is the highest-priority unmet need.

OWASP describes plaintext credentials in source and configuration as a recurring secrets-management concern and recommends managed storage and rotation practices. CISA's small and medium business resources emphasize practical fundamentals such as passwords, MFA, software updates, backups, logging, and encryption. Together these point to demand for understandable, actionable security workflows, while public vendor offerings show that secret detection is already a developed category.

GitHub provides secret-scanning alerts free for public repositories; its documentation says private organization repositories generally require GitHub Secret Protection on Team or Enterprise. GitGuardian publishes a free Starter plan with limits and sales-led higher tiers. TruffleHog provides a free open-source scanner alongside an enterprise product. These offerings validate the category and also make it difficult to compete on detection depth alone.

## Ideas compared

Scores are a qualitative decision aid, not measured market data. Each criterion is scored 1–5, with equal weights: demand evidence, problem value, differentiation, individual feasibility, and privacy/safety. Total is the average multiplied by 20. Strong competitor coverage lowers differentiation scores; privacy/safety scores reflect the implementation risk of a responsible MVP.

| Rank | Idea | Demand | Value | Differentiation | Feasibility | Privacy / safety | Total / 100 | Assessment |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | Local browser-based secret review for a selected project folder | 5 | 5 | 3 | 5 | 5 | 92 | Established risk and a narrow, low-cost workflow; detection breadth remains limited. |
| 2 | Plain-language small-business security baseline tracker | 5 | 4 | 2 | 5 | 5 | 84 | Clear guidance need, but many checklists already exist and evidence tracking adds little technical differentiation. |
| 3 | Backup readiness and restore-drill tracker | 4 | 5 | 3 | 3 | 4 | 76 | High impact, but reliable integrations and restore verification need access to customer systems. |
| 4 | Local dependency-risk summary for small repositories | 4 | 4 | 1 | 4 | 4 | 68 | Useful, but crowded by package-manager, GitHub, and SCA products. |
| 5 | Local phishing-message/header explainer | 4 | 4 | 3 | 3 | 2 | 64 | Useful educational workflow; email content is sensitive and detection quality is difficult to validate. |
| 6 | Website TLS and security-header checker | 5 | 4 | 1 | 3 | 1 | 56 | Demand is evident, but free alternatives are strong and remote URL fetching creates SSRF and authorization risks. |

## Selected product: Local Secret Review

**Problem:** A developer, student, or small team can accidentally leave credentials in a project working tree and may lack a simple, private first check before sharing or pushing it.

**Audience:** Individual developers, students, and small teams reviewing local source folders. This is a helper for a human review, not an organization-wide secret-management system.

**Use cases:** Run a quick local check; find a file and line to inspect; understand an immediate response; export a redacted inventory for follow-up.

**Proposed solution and differentiator:** A static browser app with an optional loopback-only server. The browser reads only the folder the user selects, applies a small documented set of patterns, and never transmits matched text. Compared with broad CLI and SaaS scanners, it favors a quick visual review and minimal setup over coverage, history scanning, verification, or fleet monitoring.

**Essential features:** Folder selection, bounded scanning, six pattern rules, severity and path context, search/filtering, session-only review status, CSV export without matched values, and explicit limitations.

**Future ideas (not implemented):** Configurable rules with safe validation; an optional Gitleaks/TruffleHog bridge; browser-supported archive analysis; history scanning through a separate, reviewed local tool; user testing with developers and small businesses.

**Requirements:** Current Chromium folder-picker support; Python 3.10+ for the secure local static server; Node.js 20+ only for tests. No account, database, cloud service, or runtime package is required.

**Limits and privacy requirements:** Keep scans local, bound work, never display or export matched values, escape all file-derived text, do not claim a clean result proves safety, and recommend revocation/rotation for real leaks.

**Success criteria for this MVP:** A user can select a folder, inspect bounded heuristic results, and export a report containing no matched secret values. Automated tests cover pattern behavior and server boundaries. Customer value and market viability remain unvalidated.

## Market validation limits

The report uses public threat data and existing products as market signals, not as proof of an underserved niche or commercial viability. The privacy and usability proposition should be tested with target users. Established products provide substantially broader detection and remediation features; this MVP should not be sold as their equivalent.

## Sources

All accessed 14 October 2026.

- Verizon, [2026 Data Breach Investigations Report](https://www.verizon.com/business/resources/reports/dbir/) and [SMB infographic PDF](https://www.verizon.com/business/resources/infographics/2026-dbir-bis-smb-revenue-losses.pdf) (published May/June 2026).
- CISA, [Small and Medium-Sized Business Resources](https://www.cisa.gov/small-and-medium-sized-business-resources) (current resource page; page fetch was blocked in this research environment, so claims are limited to the search-indexed page summary).
- OWASP, [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) (living guidance).
- GitHub Docs, [Secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning) and [Advanced Security license billing](https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security) (current documentation).
- Gitleaks, [official repository](https://github.com/gitleaks/gitleaks) (open-source local and Git-history scanning; documentation supports configurable rules and multiple report formats).
- Truffle Security, [TruffleHog pricing](https://trufflesecurity.com/pricing) and [user enablement guide](https://trufflesecurity.com/docs/user-enablement-guide) (open-source and enterprise offerings; dashboard and triage examples).
- GitGuardian, [pricing](https://www.gitguardian.com/pricing) and [plan usage](https://docs.gitguardian.com/platform/user-account/plan-usage) (published free-tier limits and higher-tier capabilities).
- NIST, [SP 800-218 Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final), published February 2022 (secure-development guidance, not a secrets-specific certification).
