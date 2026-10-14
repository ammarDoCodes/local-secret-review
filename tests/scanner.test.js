import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scanText, shouldSkipPath } from "../assets/scanner.js";

test("detects provider-shaped access identifiers without returning matched values", () => {
  const token = ["AKIA", "1234567890ABCDEF"].join("");
  const findings = scanText(`const id = "${token}";`, "src/config.js");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, "aws-access-key-id");
  assert.equal(findings[0].line, 1);
  assert.equal(JSON.stringify(findings).includes(token), false);
});

test("detects credential-like assignments and ignores obvious placeholders", () => {
  const value = ["R7m$Np4", "Bc9!Q2z"].join("");
  const source = `api_key = "${value}"\npassword = "${"example"}"`;
  const findings = scanText(source, "settings.env");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, "credential-assignment");
  assert.equal(findings[0].line, 1);
});

test("detects private-key marker and records only the file location", () => {
  const marker = ["-----BEGIN ", "PRIVATE KEY-----"].join("");
  const findings = scanText(`${marker}\nbody`, "keys/id.pem");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].severity, "Critical");
  assert.equal(findings[0].path, "keys/id.pem");
});

test("uses one-based line numbers and returns findings in source order", () => {
  const token = ["AIza", "0123456789abcdefghijABCDEFGHIJKLMNO"].join("");
  const findings = scanText(`first line\nsecond line ${token}`, "app.txt");
  assert.equal(findings[0].line, 2);
});

test("skips repository history and generated dependency directories", () => {
  assert.equal(shouldSkipPath("project/.git/config"), true);
  assert.equal(shouldSkipPath("project/node_modules/pkg/index.js"), true);
  assert.equal(scanText("secret = value that should never be scanned", "project/.git/config").length, 0);
  assert.equal(shouldSkipPath("src/app.js"), false);
});

test("ignores weak credential-like assignments", () => {
  assert.equal(scanText('password = "short"', "config.txt").length, 0);
  assert.equal(scanText('password = "${process.env.PASSWORD}"', "config.txt").length, 0);
});

test("detects the supported GitHub and Slack token shapes", () => {
  const githubToken = ["ghp_", "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6"].join("");
  const slackToken = ["xoxb-", "1234567890-ABCDEFGH1234567"].join("");
  const findings = scanText(`${githubToken}\n${slackToken}`, "config.txt");
  assert.deepEqual(findings.map((finding) => finding.ruleId), ["github-token", "slack-token"]);
  assert.equal(JSON.stringify(findings).includes(githubToken), false);
  assert.equal(JSON.stringify(findings).includes(slackToken), false);
});

test("the detector source does not match its own rule definitions", () => {
  const source = readFileSync(new URL("../assets/scanner.js", import.meta.url), "utf8");
  assert.deepEqual(scanText(source, "assets/scanner.js"), []);
});

test("the project source and documentation contain no matches for these rules", () => {
  const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
  const extensions = new Set([".html", ".css", ".js", ".py", ".md", ".json", ".svg"]);
  const ignored = new Set([".git", "node_modules", "__pycache__", ".pytest_cache", "dist"]);
  const pending = [root];
  const matches = [];

  while (pending.length) {
    const directory = pending.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) pending.push(fullPath);
        continue;
      }
      const relPath = relative(root, fullPath).replaceAll("\\", "/");
      if (!extensions.has(`.${entry.name.split(".").at(-1)}`) && entry.name !== ".gitignore") continue;
      const text = readFileSync(fullPath, "utf8");
      if (!text.includes("\u0000")) matches.push(...scanText(text, relPath));
    }
  }

  assert.deepEqual(matches, []);
});
