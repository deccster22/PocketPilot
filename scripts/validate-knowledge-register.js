const fs = require('node:fs');
const path = require('node:path');

const {
  DOC_FAMILY_ORDER,
  FAMILY_PATH_PREFIXES,
  REQUIRED_CORE_FAMILIES,
  RETIRED_SHELF_PREFIXES,
  SUPPORTED_REGISTER_FAMILIES,
} = require('./knowledge-catalog-config');

const REGISTER_RELATIVE_PATH = path.join('docs', 'knowledge', '_register', 'CONTENT_REGISTER.csv');
const REQUIRED_COLUMNS = ['topicId', 'family', 'canonicalPath'];

function parseCsv(text) {
  const rows = [];
  const normalized = text.replace(/\r\n/g, '\n').trim();
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];

    if (character === '"') {
      if (inQuotes && normalized[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if (character === '\n' && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += character;
  }

  row.push(current);
  rows.push(row);

  const [header = [], ...dataRows] = rows;
  const records = dataRows
    .filter((candidate) => candidate.some((value) => value.trim().length > 0))
    .map((candidate) =>
      Object.fromEntries(header.map((key, index) => [key, candidate[index] ?? ''])),
    );

  return {
    header,
    records,
  };
}

function normalizePathForComparison(rawPath) {
  return rawPath.trim().replace(/\\/g, '/');
}

function normalizeFamily(rawFamily) {
  return rawFamily.trim().toLowerCase();
}

function sortFamiliesByCatalogOrder(families) {
  return [...families].sort((left, right) => {
    const leftIndex = DOC_FAMILY_ORDER.indexOf(left);
    const rightIndex = DOC_FAMILY_ORDER.indexOf(right);

    if (leftIndex !== -1 && rightIndex !== -1) {
      return leftIndex - rightIndex;
    }

    if (leftIndex !== -1) {
      return -1;
    }

    if (rightIndex !== -1) {
      return 1;
    }

    return left.localeCompare(right);
  });
}

function validateRegisterRows(rows, options = {}) {
  const {
    rootDir = process.cwd(),
    pathExists = fs.existsSync,
  } = options;

  const errors = [];
  const representedFamilies = new Set();
  const seenTopicIds = new Map();
  const approvedPathPrefixes = Object.values(FAMILY_PATH_PREFIXES);

  rows.forEach((row, rowIndex) => {
    const lineNumber = rowIndex + 2;
    const topicId = (row.topicId ?? '').trim();
    const family = normalizeFamily(row.family ?? '');
    const canonicalPath = normalizePathForComparison(row.canonicalPath ?? '');

    if (topicId.length === 0) {
      errors.push(`line ${lineNumber}: missing required topicId.`);
    } else if (seenTopicIds.has(topicId)) {
      errors.push(
        `line ${lineNumber}: duplicate topicId "${topicId}" (first seen at line ${seenTopicIds.get(topicId)}).`,
      );
    } else {
      seenTopicIds.set(topicId, lineNumber);
    }

    if (family.length === 0) {
      errors.push(`line ${lineNumber}: missing required family for topic "${topicId || '<missing>'}".`);
    } else if (!SUPPORTED_REGISTER_FAMILIES.includes(family)) {
      errors.push(
        `line ${lineNumber}: unsupported family "${family}". Allowed families: ${SUPPORTED_REGISTER_FAMILIES.join(', ')}.`,
      );
    } else {
      representedFamilies.add(family);
    }

    if (canonicalPath.length === 0) {
      errors.push(
        `line ${lineNumber}: missing required canonicalPath for topic "${topicId || '<missing>'}".`,
      );
      return;
    }

    RETIRED_SHELF_PREFIXES.forEach((retiredPrefix) => {
      if (canonicalPath.startsWith(retiredPrefix)) {
        errors.push(
          `line ${lineNumber}: canonicalPath "${canonicalPath}" uses retired shelf path "${retiredPrefix}".`,
        );
      }
    });

    const approvedPrefix = approvedPathPrefixes.find((prefix) => canonicalPath.startsWith(prefix));
    if (!approvedPrefix) {
      errors.push(
        `line ${lineNumber}: canonicalPath "${canonicalPath}" is outside approved active/support knowledge families.`,
      );
    }

    if (SUPPORTED_REGISTER_FAMILIES.includes(family)) {
      const expectedPrefix = FAMILY_PATH_PREFIXES[family];

      if (!canonicalPath.startsWith(expectedPrefix)) {
        errors.push(
          `line ${lineNumber}: canonicalPath "${canonicalPath}" does not match family "${family}" expected prefix "${expectedPrefix}".`,
        );
      }
    }

    const absolutePath = path.resolve(rootDir, canonicalPath);
    if (!pathExists(absolutePath)) {
      errors.push(
        `line ${lineNumber}: canonicalPath "${canonicalPath}" does not exist on disk.`,
      );
    }
  });

  const missingCoreFamilies = REQUIRED_CORE_FAMILIES.filter(
    (family) => !representedFamilies.has(family),
  );

  if (missingCoreFamilies.length > 0) {
    errors.push(
      `register missing required core families: ${missingCoreFamilies.join(', ')}.`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    rowCount: rows.length,
    uniqueTopicIdCount: seenTopicIds.size,
    representedFamilies: sortFamiliesByCatalogOrder([...representedFamilies]),
  };
}

function validateKnowledgeRegister(options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const registerPath = path.join(rootDir, REGISTER_RELATIVE_PATH);
  const errors = [];

  if (!fs.existsSync(registerPath)) {
    return {
      isValid: false,
      errors: [`register file not found: ${REGISTER_RELATIVE_PATH}`],
      rowCount: 0,
      uniqueTopicIdCount: 0,
      representedFamilies: [],
    };
  }

  const registerContents = fs.readFileSync(registerPath, 'utf8');
  const parsed = parseCsv(registerContents);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !parsed.header.includes(column));

  if (missingColumns.length > 0) {
    errors.push(
      `register is missing required columns: ${missingColumns.join(', ')}.`,
    );
  }

  if (parsed.records.length === 0) {
    errors.push('register contains no topic rows.');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      rowCount: parsed.records.length,
      uniqueTopicIdCount: 0,
      representedFamilies: [],
    };
  }

  return validateRegisterRows(parsed.records, {
    rootDir,
  });
}

function runValidationCli(options = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const result = validateKnowledgeRegister({
    rootDir: options.rootDir ?? process.cwd(),
  });

  if (result.isValid) {
    stdout.write(
      `Knowledge register validation passed (${result.rowCount} rows, ${result.uniqueTopicIdCount} unique topic IDs).\n`,
    );
    stdout.write(`Represented families: ${result.representedFamilies.join(', ')}\n`);
    return 0;
  }

  stderr.write(
    `Knowledge register validation failed with ${result.errors.length} issue(s):\n`,
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
  REGISTER_RELATIVE_PATH,
  REQUIRED_COLUMNS,
  parseCsv,
  validateRegisterRows,
  validateKnowledgeRegister,
  runValidationCli,
};
