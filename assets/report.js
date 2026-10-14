function csvCell(value) {
  const text = String(value);
  const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function serializeReport(findings, reviewed) {
  const rows = [["severity", "finding", "path", "line", "confidence", "reviewed", "remediation"]];
  for (const finding of findings) {
    const key = `${finding.ruleId}:${finding.path}:${finding.line}`;
    rows.push([
      finding.severity,
      finding.title,
      finding.path,
      finding.line,
      finding.confidence,
      reviewed.has(key) ? "yes" : "no",
      finding.fix
    ]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}
