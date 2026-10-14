const EXCLUDED_DIRECTORIES = new Set([
  ".git", "node_modules", "vendor", "dist", "build", "target",
  ".venv", "venv", "coverage", "__pycache__", ".pytest_cache", ".next", ".cache"
]);

const PLACEHOLDER = /^(?:example|sample|dummy|fake|test|placeholder|redacted|changeme|replace(?:me|_me)?|your[_-].*|<.*>|\$\{.*\}|process\.env\..*|undefined|null|none|todo|x{4,}|0{4,})$/i;

const RULES = [
  {
    id: "private-key-marker",
    title: "Private key material",
    severity: "Critical",
    confidence: "High",
    fix: "Remove the key from the repository, rotate it with its issuer, and store the replacement in an approved secret manager.",
    expression: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g
  },
  {
    id: "github-token",
    title: "GitHub access token",
    severity: "High",
    confidence: "High",
    fix: "Revoke or rotate the token, remove it from the working tree, and use a scoped credential store or environment variable.",
    expression: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/g
  },
  {
    id: "aws-access-key-id",
    title: "AWS access key identifier",
    severity: "High",
    confidence: "High",
    fix: "Disable or rotate the related AWS credentials and replace long-lived keys with short-lived role credentials.",
    expression: /\bAKIA[0-9A-Z]{16}\b/g
  },
  {
    id: "google-api-key",
    title: "Google API key",
    severity: "High",
    confidence: "High",
    fix: "Revoke or rotate the key, restrict its API and origin scope, and move it to a managed secret store.",
    expression: /\bAIza[0-9A-Za-z_-]{35}\b/g
  },
  {
    id: "slack-token",
    title: "Slack access token",
    severity: "High",
    confidence: "High",
    fix: "Revoke or rotate the token in Slack and replace it with a least-privilege credential held outside source control.",
    expression: /\bxox[baprs]-[A-Za-z0-9-]{15,}\b/g
  },
  {
    id: "credential-assignment",
    title: "Credential-like assignment",
    severity: "Medium",
    confidence: "Review needed",
    fix: "Check whether this value grants access. If it is a real credential, rotate it and move it to a secret manager or environment variable.",
    expression: /["']?\b(?:api[_-]?key|secret(?:[_-]?key)?|access[_-]?token|client[_-]?secret|password|passwd|pwd|private[_-]?key)\b["']?\s*[:=]\s*(?:"([^"\r\n]{8,512})"|'([^'\r\n]{8,512})'|([^\s,;#"']{8,512}))/gi,
    capture: true
  }
];

export const SCAN_LIMITS = Object.freeze({
  files: 5000,
  fileBytes: 1024 * 1024,
  totalBytes: 50 * 1024 * 1024
});

export function shouldSkipPath(path) {
  const segments = String(path).replaceAll("\\", "/").split("/").filter(Boolean);
  return segments.some((segment) => EXCLUDED_DIRECTORIES.has(segment.toLowerCase()));
}

function isPlaceholder(value) {
  const normalized = value.trim().replace(/^['"`]|['"`]$/g, "");
  return !normalized || PLACEHOLDER.test(normalized) || /^(?:\*+|\.+|[-_]+)$/.test(normalized);
}

function looksLikeCredential(value) {
  if (isPlaceholder(value)) return false;
  const normalized = value.trim();
  return normalized.length >= 8 && new Set(normalized).size >= 6;
}

export function scanText(text, path) {
  if (shouldSkipPath(path) || typeof text !== "string") return [];
  const findings = [];
  const seen = new Set();
  const lines = text.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    let specificMatched = false;
    for (const rule of RULES) {
      rule.expression.lastIndex = 0;
      let match;
      while ((match = rule.expression.exec(line)) !== null) {
        if (rule.capture && specificMatched) break;
        const candidate = rule.capture ? (match[1] ?? match[2] ?? match[3] ?? "") : match[0];
        if (rule.capture && !looksLikeCredential(candidate)) continue;
        const key = `${rule.id}:${lineIndex + 1}`;
        if (seen.has(key)) continue;
        seen.add(key);
        findings.push({
          ruleId: rule.id,
          title: rule.title,
          severity: rule.severity,
          confidence: rule.confidence,
          path: String(path).replaceAll("\\", "/"),
          line: lineIndex + 1,
          fix: rule.fix
        });
        if (!rule.capture) specificMatched = true;
        if (!rule.expression.global) break;
        if (match[0] === "") rule.expression.lastIndex += 1;
      }
    }
  }

  return findings;
}
