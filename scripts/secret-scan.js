#!/usr/bin/env node

const { execSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function getTargetFiles() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (baseRef) {
    const mergeBase = run(`git merge-base HEAD origin/${baseRef}`);
    if (mergeBase) {
      const diffFiles = run(`git diff --name-only --diff-filter=ACMRT ${mergeBase}...HEAD`);
      if (diffFiles) {
        return diffFiles.split('\n').filter(Boolean);
      }
    }
  }

  const staged = run('git diff --cached --name-only --diff-filter=ACMRT');
  const unstaged = run('git diff --name-only --diff-filter=ACMRT');

  const combined = [...staged.split('\n'), ...unstaged.split('\n')]
    .map((file) => file.trim())
    .filter(Boolean);

  if (combined.length > 0) {
    return [...new Set(combined)];
  }

  const tracked = run('git ls-files');
  return tracked ? tracked.split('\n').filter(Boolean) : [];
}

const patterns = [
  { name: 'OpenAI-style secret', regex: /\bsk-[a-zA-Z0-9_-]{16,}\b/g },
  {
    name: 'Potential API key assignment',
    regex: /\b(?:api[_-]?key|x-api-key)\b\s*[:=]\s*["']?[A-Za-z0-9+/=_-]{20,}["']?/gi,
  },
  { name: 'Bearer token header', regex: /Authorization\s*:\s*Bearer\s+[A-Za-z0-9._-]{12,}/gi },
];



function isIgnored(filePath) {
  const p = filePath.replace(/\\/g, "/"); // normalise Windows paths

  // keep your existing ignores first/after this

  if (p.endsWith("/.env.example") || p === ".env.example") return true;
  if (p.includes("/core/config/__tests__/")) return true;

  
  return false; // or your existing default
}

// helpers
function truncateMatch(match) {
  if (match.length <= 8) {
    return '[REDACTED]';
  }

  return `${match.slice(0, 4)}…[REDACTED]`;
}

// scanning logic
function scanFile(filePath) {
  let content;

  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  const findings = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    patterns.forEach((pattern) => {
      const matches = [...line.matchAll(pattern.regex)];

      matches.forEach((match) => {
        findings.push({
          filePath,
          line: index + 1,
          type: pattern.name,
          sample: truncateMatch(match[0]),  // <-- now defined
        });
      });
    });
  });

  return findings;
}

function main() {
  const files = getTargetFiles().filter((file) => !isIgnored(file));
  const findings = [];

  files.forEach((filePath) => {
    findings.push(...scanFile(filePath));
  });

  const trackedEnvFiles = run("git ls-files '.env' '.env.*'")
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean);

  trackedEnvFiles.forEach((filePath) => {
    findings.push({
      filePath,
      line: 1,
      type: 'Tracked env file',
      sample: '[REDACTED]',
    });
  });

  if (findings.length > 0) {
    findings.forEach((finding) => {
      console.error(
        `FOUND POSSIBLE SECRET in file ${finding.filePath} line ${finding.line} (${finding.type}: ${finding.sample})`,
      );
    });

    process.exit(1);
  }

  console.log(`Secret scan passed (${files.length} files checked).`);
}

main();
