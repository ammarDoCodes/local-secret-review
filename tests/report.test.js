import test from "node:test";
import assert from "node:assert/strict";
import { serializeReport } from "../assets/report.js";

test("exports metadata only and leaves matched values out of the report", () => {
  const matchedValue = ["R7m$Np4", "Bc9!Q2z"].join("");
  const csv = serializeReport([{
    ruleId: "credential-assignment",
    severity: "Medium",
    title: "Credential-like assignment",
    path: "settings.env",
    line: 4,
    confidence: "Review needed",
    fix: "Rotate the value if it is a real credential."
  }], new Set());
  assert.match(csv, /^"severity","finding","path","line"/);
  assert.equal(csv.includes(matchedValue), false);
});

test("neutralizes spreadsheet formula-leading file paths", () => {
  const csv = serializeReport([{
    ruleId: "credential-assignment",
    severity: "Medium",
    title: "Credential-like assignment",
    path: "=HYPERLINK(\"https://example.invalid\")",
    line: 1,
    confidence: "Review needed",
    fix: "Review the value."
  }], new Set());
  assert.match(csv, /,"'=HYPERLINK/);
});
