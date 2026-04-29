const fs = require('node:fs');
const path = require('node:path');

const {
  parseCsv,
  REGISTER_RELATIVE_PATH,
} = require('./validate-knowledge-register');
const {
  RUNTIME_REQUIRED_REGISTER_TOPIC_IDS,
  RUNTIME_ALLOWED_UNREGISTERED_TOPIC_IDS,
} = require('./knowledge-runtime-catalog-sync-config');

const KNOWLEDGE_CATALOG_RELATIVE_PATH = path.join(
  'services',
  'knowledge',
  'knowledgeCatalog.ts',
);
const TOPIC_ID_PATTERN = /["']?topicId["']?\s*:\s*['"]([^'"]+)['"]/g;

function collectDuplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
      return;
    }

    seen.add(value);
  });

  return [...duplicates].sort();
}

function toLineNumber(text, index) {
  return text.slice(0, index).split('\n').length;
}

function parseRuntimeCatalogTopicIds(source) {
  const topicIds = [];
  const lineByTopicId = new Map();
  const duplicateTopicEntries = [];
  let match;

  while ((match = TOPIC_ID_PATTERN.exec(source)) !== null) {
    const topicId = match[1];
    const lineNumber = toLineNumber(source, match.index);
    topicIds.push(topicId);

    if (lineByTopicId.has(topicId)) {
      duplicateTopicEntries.push({
        topicId,
        firstLine: lineByTopicId.get(topicId),
        duplicateLine: lineNumber,
      });
      continue;
    }

    lineByTopicId.set(topicId, lineNumber);
  }

  return {
    topicIds,
    duplicateTopicEntries,
  };
}

function toTopicIdSet(rows) {
  return new Set(
    rows
      .map((row) => (row.topicId ?? '').trim())
      .filter((topicId) => topicId.length > 0),
  );
}

function validateKnowledgeRuntimeCatalogSync(options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const registerRelativePath = options.registerRelativePath ?? REGISTER_RELATIVE_PATH;
  const catalogRelativePath =
    options.catalogRelativePath ?? KNOWLEDGE_CATALOG_RELATIVE_PATH;
  const requiredRegisterTopicIds =
    options.requiredRegisterTopicIds ?? RUNTIME_REQUIRED_REGISTER_TOPIC_IDS;
  const allowedUnregisteredRuntimeTopicIds =
    options.allowedUnregisteredRuntimeTopicIds ??
    RUNTIME_ALLOWED_UNREGISTERED_TOPIC_IDS;
  const errors = [];

  const registerPath = path.join(rootDir, registerRelativePath);
  const catalogPath = path.join(rootDir, catalogRelativePath);

  if (!fs.existsSync(registerPath)) {
    return {
      isValid: false,
      errors: [`register file not found: ${registerRelativePath}`],
      registerTopicCount: 0,
      runtimeTopicCount: 0,
      runtimeRequiredTopicCount: requiredRegisterTopicIds.length,
      docsOnlyRegisterTopicCount: 0,
    };
  }

  if (!fs.existsSync(catalogPath)) {
    return {
      isValid: false,
      errors: [`runtime catalog file not found: ${catalogRelativePath}`],
      registerTopicCount: 0,
      runtimeTopicCount: 0,
      runtimeRequiredTopicCount: requiredRegisterTopicIds.length,
      docsOnlyRegisterTopicCount: 0,
    };
  }

  const registerRows = parseCsv(fs.readFileSync(registerPath, 'utf8')).records;
  const registerTopicIds = toTopicIdSet(registerRows);
  const runtimeSource = fs.readFileSync(catalogPath, 'utf8');
  const runtimeParse = parseRuntimeCatalogTopicIds(runtimeSource);
  const runtimeTopicIds = runtimeParse.topicIds;
  const runtimeTopicIdSet = new Set(runtimeTopicIds);
  const requiredTopicIdSet = new Set(requiredRegisterTopicIds);
  const allowedUnregisteredTopicIdSet = new Set(allowedUnregisteredRuntimeTopicIds);

  const requiredConfigDuplicates = collectDuplicateValues(requiredRegisterTopicIds);
  const allowedConfigDuplicates = collectDuplicateValues(
    allowedUnregisteredRuntimeTopicIds,
  );

  if (requiredConfigDuplicates.length > 0) {
    errors.push(
      `runtime required topic config contains duplicate IDs: ${requiredConfigDuplicates.join(', ')}`,
    );
  }

  if (allowedConfigDuplicates.length > 0) {
    errors.push(
      `runtime allowed-unregistered topic config contains duplicate IDs: ${allowedConfigDuplicates.join(', ')}`,
    );
  }

  if (runtimeParse.duplicateTopicEntries.length > 0) {
    runtimeParse.duplicateTopicEntries.forEach((entry) => {
      errors.push(
        `runtime catalog duplicate topicId "${entry.topicId}" at lines ${entry.firstLine} and ${entry.duplicateLine}.`,
      );
    });
  }

  const requiredMissingFromRegister = requiredRegisterTopicIds.filter(
    (topicId) => !registerTopicIds.has(topicId),
  );
  if (requiredMissingFromRegister.length > 0) {
    errors.push(
      `runtime-required register topic IDs missing from CONTENT_REGISTER.csv: ${requiredMissingFromRegister.join(', ')}`,
    );
  }

  const requiredMissingFromRuntime = requiredRegisterTopicIds.filter(
    (topicId) => !runtimeTopicIdSet.has(topicId),
  );
  if (requiredMissingFromRuntime.length > 0) {
    errors.push(
      `runtime catalog missing required registered topic IDs: ${requiredMissingFromRuntime.join(', ')}`,
    );
  }

  const unexpectedUnregisteredRuntimeTopicIds = runtimeTopicIds.filter(
    (topicId) =>
      !registerTopicIds.has(topicId) &&
      !allowedUnregisteredTopicIdSet.has(topicId),
  );
  if (unexpectedUnregisteredRuntimeTopicIds.length > 0) {
    errors.push(
      `runtime catalog contains unregistered topic IDs not in explicit legacy allowlist: ${[...new Set(unexpectedUnregisteredRuntimeTopicIds)].sort().join(', ')}`,
    );
  }

  const staleAllowedUnregisteredTopicIds = allowedUnregisteredRuntimeTopicIds.filter(
    (topicId) => !runtimeTopicIdSet.has(topicId),
  );
  if (staleAllowedUnregisteredTopicIds.length > 0) {
    errors.push(
      `runtime allowlist contains topic IDs not present in runtime catalog: ${staleAllowedUnregisteredTopicIds.join(', ')}`,
    );
  }

  const allowedTopicsNowRegistered = allowedUnregisteredRuntimeTopicIds.filter((topicId) =>
    registerTopicIds.has(topicId),
  );
  if (allowedTopicsNowRegistered.length > 0) {
    errors.push(
      `runtime allowlist contains IDs now registered in CONTENT_REGISTER.csv (move to required list): ${allowedTopicsNowRegistered.join(', ')}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    registerTopicCount: registerTopicIds.size,
    runtimeTopicCount: runtimeTopicIds.length,
    runtimeRequiredTopicCount: requiredTopicIdSet.size,
    docsOnlyRegisterTopicCount: [...registerTopicIds].filter(
      (topicId) => !requiredTopicIdSet.has(topicId),
    ).length,
  };
}

function runValidationCli(options = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const result = validateKnowledgeRuntimeCatalogSync({
    rootDir: options.rootDir ?? process.cwd(),
  });

  if (result.isValid) {
    stdout.write(
      `Knowledge runtime catalog sync validation passed (register: ${result.registerTopicCount}, runtime catalog: ${result.runtimeTopicCount}, runtime-required register topics: ${result.runtimeRequiredTopicCount}, docs-only register topics: ${result.docsOnlyRegisterTopicCount}).\n`,
    );
    return 0;
  }

  stderr.write(
    `Knowledge runtime catalog sync validation failed with ${result.errors.length} issue(s):\n`,
  );
  result.errors.forEach((error) => {
    stderr.write(`- ${error}\n`);
  });
  return 1;
}

if (require.main === module) {
  process.exitCode = runValidationCli();
}

module.exports = {
  KNOWLEDGE_CATALOG_RELATIVE_PATH,
  parseRuntimeCatalogTopicIds,
  validateKnowledgeRuntimeCatalogSync,
  runValidationCli,
};
