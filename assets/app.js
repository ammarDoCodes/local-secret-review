import { SCAN_LIMITS, scanText, shouldSkipPath } from "./scanner.js";
import { serializeReport } from "./report.js";

const folderInput = document.querySelector("#folder-input");
const chooseButton = document.querySelector("#choose-folder");
const runButton = document.querySelector("#run-scan");
const exportButton = document.querySelector("#export-report");
const statusMessage = document.querySelector("#status-message");
const progress = document.querySelector("#scan-progress");
const progressLabel = document.querySelector("#progress-label");
const resultsBody = document.querySelector("#results-body");
const emptyResults = document.querySelector("#empty-results");
const searchInput = document.querySelector("#finding-search");
const severityFilter = document.querySelector("#severity-filter");
const reviewedCount = document.querySelector("#reviewed-count");
const resultCount = document.querySelector("#result-count");
const analyzedCount = document.querySelector("#analyzed-count");
const skippedCount = document.querySelector("#skipped-count");
const criticalCount = document.querySelector("#critical-count");
const highCount = document.querySelector("#high-count");
const mediumCount = document.querySelector("#medium-count");
const lastScan = document.querySelector("#last-scan");

let findings = [];
let scanCompleted = false;
let reviewed = new Set();

document.querySelectorAll("[data-view-link]").forEach((link) => {
  link.addEventListener("click", () => switchView(link.dataset.viewLink));
});

document.querySelectorAll("[data-open-view]").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.openView));
});

chooseButton.addEventListener("click", () => folderInput.click());
folderInput.addEventListener("change", () => {
  const count = folderInput.files?.length ?? 0;
  runButton.disabled = count === 0;
  if (count) setStatus(`${count.toLocaleString()} files selected. Review scan limits, then start the scan.`);
});

runButton.addEventListener("click", runScan);
exportButton.addEventListener("click", exportReport);
searchInput.addEventListener("input", renderFindings);
severityFilter.addEventListener("change", renderFindings);

function switchView(view) {
  document.querySelectorAll("[data-view]").forEach((section) => {
    section.hidden = section.dataset.view !== view;
  });
  document.querySelectorAll("[data-view-link]").forEach((link) => {
    if (link.dataset.viewLink === view) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const label = view === "overview" ? "Overview" : view === "findings" ? "Findings" : "How it works";
  document.querySelector("#page-heading").textContent = label;
  document.querySelector("#main-content").focus({ preventScroll: true });
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function pathFor(file) {
  return file.webkitRelativePath || file.name;
}

async function runScan() {
  const selected = Array.from(folderInput.files ?? []);
  if (!selected.length) return;

  runButton.disabled = true;
  chooseButton.disabled = true;
  exportButton.disabled = true;
  progress.hidden = false;
  progress.value = 0;
  findings = [];
  reviewed = new Set();
  scanCompleted = false;
  const candidates = selected.slice(0, SCAN_LIMITS.files);
  let eligibleBytes = 0;
  const work = [];
  const counts = { skippedDirectory: 0, skippedLimit: selected.length - candidates.length, skippedLarge: 0, skippedBinary: 0, failed: 0 };

  for (const file of candidates) {
    const path = pathFor(file);
    if (shouldSkipPath(path)) {
      counts.skippedDirectory += 1;
      continue;
    }
    if (file.size > SCAN_LIMITS.fileBytes) {
      counts.skippedLarge += 1;
      continue;
    }
    if (eligibleBytes + file.size > SCAN_LIMITS.totalBytes) {
      counts.skippedLimit += 1;
      continue;
    }
    eligibleBytes += file.size;
    work.push(file);
  }

  setStatus(`Scanning ${work.length.toLocaleString()} eligible files locally in this browser…`);
  for (let index = 0; index < work.length; index += 1) {
    const file = work[index];
    try {
      const text = await file.text();
      if (text.includes("\u0000")) {
        counts.skippedBinary += 1;
      } else {
        findings.push(...scanText(text, pathFor(file)));
      }
    } catch {
      counts.failed += 1;
    }
    progress.value = work.length ? Math.round(((index + 1) / work.length) * 100) : 100;
    progressLabel.textContent = `${(index + 1).toLocaleString()} of ${work.length.toLocaleString()} files`;
    if (index % 30 === 29) await new Promise((resolve) => setTimeout(resolve, 0));
  }

  findings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.path.localeCompare(b.path) || a.line - b.line);
  scanCompleted = true;
  updateSummary(work.length, counts);
  renderFindings();
  exportButton.disabled = false;
  runButton.disabled = false;
  chooseButton.disabled = false;
  const skipped = Object.values(counts).reduce((sum, value) => sum + value, 0);
  setStatus(`Scan complete. ${findings.length} findings across ${work.length.toLocaleString()} files. ${skipped.toLocaleString()} files were skipped or could not be read.`);
  progress.hidden = true;
}

function severityRank(severity) {
  return severity === "Critical" ? 0 : severity === "High" ? 1 : severity === "Medium" ? 2 : 3;
}

function updateSummary(files, counts) {
  analyzedCount.textContent = files.toLocaleString();
  resultCount.textContent = findings.length.toLocaleString();
  document.querySelector("#nav-findings").textContent = findings.length.toLocaleString();
  criticalCount.textContent = findings.filter((item) => item.severity === "Critical").length.toLocaleString();
  highCount.textContent = findings.filter((item) => item.severity === "High").length.toLocaleString();
  mediumCount.textContent = findings.filter((item) => item.severity === "Medium").length.toLocaleString();
  skippedCount.textContent = Object.values(counts).reduce((sum, value) => sum + value, 0).toLocaleString();
  lastScan.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  renderReviewedCount();
}

function renderFindings() {
  const query = searchInput.value.trim().toLowerCase();
  const severity = severityFilter.value;
  const visible = findings.filter((item) => {
    const matchesQuery = !query || `${item.path} ${item.title} ${item.ruleId}`.toLowerCase().includes(query);
    return matchesQuery && (!severity || item.severity === severity);
  });

  resultsBody.replaceChildren();
  emptyResults.hidden = visible.length !== 0;
  if (findings.length === 0 && scanCompleted) {
    emptyResults.querySelector("strong").textContent = "No supported credential patterns found";
    emptyResults.querySelector("p").textContent = "That is a useful signal, not a guarantee. This scan checks the selected working-tree files against the documented rules.";
  } else if (findings.length === 0) {
    emptyResults.querySelector("strong").textContent = "Your findings will appear here";
    emptyResults.querySelector("p").textContent = "Choose a project folder and run a local scan to review supported credential patterns.";
  } else if (visible.length === 0) {
    emptyResults.querySelector("strong").textContent = "No findings match these filters";
    emptyResults.querySelector("p").textContent = "Try clearing the search text or severity filter.";
  }

  for (const finding of visible) resultsBody.append(makeFindingRow(finding));
  renderReviewedCount();
}

function makeFindingRow(finding) {
  const row = document.createElement("tr");
  const severityCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `severity severity-${finding.severity.toLowerCase()}`;
  badge.textContent = finding.severity;
  severityCell.append(badge);

  const categoryCell = document.createElement("td");
  const title = document.createElement("strong");
  title.textContent = finding.title;
  const confidence = document.createElement("span");
  confidence.className = "secondary-text";
  confidence.textContent = `${finding.confidence} confidence`;
  categoryCell.append(title, confidence);

  const locationCell = document.createElement("td");
  const path = document.createElement("code");
  path.textContent = finding.path;
  const line = document.createElement("span");
  line.className = "secondary-text";
  line.textContent = `Line ${finding.line}`;
  locationCell.append(path, line);

  const fixCell = document.createElement("td");
  fixCell.textContent = finding.fix;

  const actionCell = document.createElement("td");
  const reviewButton = document.createElement("button");
  reviewButton.type = "button";
  reviewButton.className = "review-button";
  const key = `${finding.ruleId}:${finding.path}:${finding.line}`;
  const isReviewed = reviewed.has(key);
  reviewButton.textContent = isReviewed ? "Reviewed" : "Mark reviewed";
  reviewButton.setAttribute("aria-pressed", String(isReviewed));
  reviewButton.addEventListener("click", () => {
    if (reviewed.has(key)) reviewed.delete(key);
    else reviewed.add(key);
    renderFindings();
  });
  actionCell.append(reviewButton);

  row.append(severityCell, categoryCell, locationCell, fixCell, actionCell);
  return row;
}

function renderReviewedCount() {
  reviewedCount.textContent = `${reviewed.size} reviewed`;
}

function exportReport() {
  if (!scanCompleted) return;
  const content = serializeReport(findings, reviewed);
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "local-secret-review.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
