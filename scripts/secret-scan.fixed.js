#!/usr/bin/env node

const { execSync } = require('node:child_process');
const { readFileSync } = require('node:fs');

function run(command) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function normalizePath(p) {
  return String(p).replace(/\\/g, '/');
}

const ALLOWLIST_FILES = new Set([
  '.env.example',
  'core/config/__tests__/redact.test.ts',
]);

const ALLOWLIST_PREFIXES = [
  'core/config/__tests__/',
  'docs/',
];

const PLACEHOLDER_TOKENS = [
  'redacted',
  '[redacted]',
  'example',
  'examplekey',
  'exampletoken',
  'changeme',
  'your_key_here',
  'your-token-here',
  'placeholder',
  'dummy',
  'fake',
];

function isAllowlisted(filePath) {
  const normalized = normalizePath(filePath);
  if (ALLOWLIST_FILES.has(normalized)) {
    return true;
  }

  return ALLOWLIST_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function isPlaceholderValue(value) {
  const v = String(value).toLowerCase();
  return PLACEHOLDER_TOKENS.some((token) => v.includes(token));
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
  const p = normalizePath(filePath);

  if (p.endsWith('/.env.example') || p === '.env.example') return true;
  if (p.includes('/core/config/__tests__/')) return true;

  return false;
}

function truncateMatch(match) {
  if (match.length <= 8) {
    return '[REDACTED]';
  }

  return `${match.slice(0, 4)}…[REDACTED]`;
}

function scanFile(filePath) {
  let content;

  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  const relPath = normalizePath(filePath);

  if (isAllowlisted(relPath)) {
    return [];
  }

  const findings = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    patterns.forEach((pattern) => {
      const matches = [...line.matchAll(pattern.regex)];

      matches.forEach((match) => {
        const value = match[0];

        if (isPlaceholderValue(value)) {
          return;
        }

        findings.push({
          filePath: relPath,
          line: index + 1,
          type: pattern.name,
          sample: truncateMatch(value),
          severity: 'fatal',
        });
      });
    });
  });

  return findings;
}

function main() {
  const files = getTargetFiles().filter((file) => !isIgnored(file));
  const warnings = [];
  const fatalFindings = [];

  files.forEach((filePath) => {
    const relPath = normalizePath(filePath);

    if (isAllowlisted(relPath)) {
      return;
    }

    scanFile(filePath).forEach((finding) => {
      if (isAllowlisted(finding.filePath)) {
        warnings.push({ ...finding, severity: 'warning' });
      } else {
        fatalFindings.push(finding);
      }
    });
  });

  const trackedEnvFiles = run("git ls-files '.env' '.env.*'")
    .split('\n')
    .map((file) => file.trim())
    .filter((file) => file && file !== '.env.example');

  trackedEnvFiles.forEach((filePath) => {
    const normalized = normalizePath(filePath);

    if (isAllowlisted(normalized)) {
      warnings.push({
        filePath: normalized,
        line: 1,
        type: 'Tracked env file',
        sample: '[REDACTED]',
        severity: 'warning',
      });
      return;
    }

    fatalFindings.push({
      filePath: normalized,
      line: 1,
      type: 'Tracked env file',
      sample: '[REDACTED]',
      severity: 'fatal',
    });
  });

  warnings.forEach((finding) => {
    console.warn(
      `WARNING possible placeholder secret in ${finding.filePath} line ${finding.line} (${finding.type}: ${finding.sample})`,
    );
  });

  if (fatalFindings.length > 0) {
    fatalFindings.forEach((finding) => {
      console.error(
        `FOUND POSSIBLE SECRET in file ${finding.filePath} line ${finding.line} (${finding.type}: ${finding.sample})`,
      );
    });

    process.exit(1);
  }

  console.log(`Secret scan passed (${files.length} files checked, ${warnings.length} warnings).`);
}

main();
