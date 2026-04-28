const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { validateKnowledgeRegister } = require('../validate-knowledge-register');

const BASE_ROWS = [
  {
    topicId: 'orientation-topic',
    family: 'orientation',
    canonicalPath: 'docs/knowledge/orientation/orientation-topic.md',
  },
  {
    topicId: 'strategy-topic',
    family: 'strategies',
    canonicalPath: 'docs/knowledge/strategies/strategy-topic.md',
  },
  {
    topicId: 'concept-topic',
    family: 'concepts',
    canonicalPath: 'docs/knowledge/concepts/concept-topic.md',
  },
  {
    topicId: 'glossary-topic',
    family: 'glossary',
    canonicalPath: 'docs/knowledge/glossary/glossary-topic.md',
  },
  {
    topicId: 'trade-hub-topic',
    family: 'trade-hub',
    canonicalPath: 'docs/knowledge/trade-hub/trade-hub-topic.md',
  },
  {
    topicId: 'interpretation-topic',
    family: 'interpretation',
    canonicalPath: 'docs/knowledge/interpretation/interpretation-topic.md',
  },
  {
    topicId: 'market-example-topic',
    family: 'market-examples',
    canonicalPath: 'docs/knowledge/market-examples/market-example-topic.md',
  },
  {
    topicId: 'action-risk-topic',
    family: 'action-risk',
    canonicalPath: 'docs/knowledge/action-risk/action-risk-topic.md',
  },
];

const HEADER = ['topicId', 'family', 'canonicalPath'];

const tempRoots = [];

function quote(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  const headerLine = HEADER.map((column) => quote(column)).join(',');
  const rowLines = rows.map((row) =>
    HEADER.map((column) => quote(row[column] ?? '')).join(','),
  );

  return [headerLine, ...rowLines].join('\n');
}

function writeFile(absolutePath, contents) {
  fs.mkdirSync(path.dirname(absolutePath), {
    recursive: true,
  });
  fs.writeFileSync(absolutePath, contents);
}

function createWorkspace(options = {}) {
  const {
    mutateRows,
    skipContentPaths = [],
    extraContentPaths = [],
  } = options;
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-knowledge-register-'));
  tempRoots.push(rootDir);

  const rows = BASE_ROWS.map((row) => ({
    ...row,
  }));

  if (mutateRows) {
    mutateRows(rows);
  }

  const registerPath = path.join(rootDir, 'docs', 'knowledge', '_register', 'CONTENT_REGISTER.csv');
  writeFile(registerPath, toCsv(rows));

  const contentPaths = [
    ...rows.map((row) => row.canonicalPath),
    ...extraContentPaths,
  ];

  contentPaths.forEach((relativePath) => {
    if (!relativePath || relativePath.trim().length === 0) {
      return;
    }

    if (skipContentPaths.includes(relativePath)) {
      return;
    }

    writeFile(path.join(rootDir, relativePath), '# Topic\n\nContent.');
  });

  return {
    rootDir,
  };
}

afterAll(() => {
  tempRoots.forEach((rootDir) => {
    fs.rmSync(rootDir, {
      recursive: true,
      force: true,
    });
  });
});

describe('validateKnowledgeRegister', () => {
  test('passes for a valid register', () => {
    const workspace = createWorkspace();
    const result = validateKnowledgeRegister({
      rootDir: workspace.rootDir,
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.rowCount).toBe(8);
    expect(result.uniqueTopicIdCount).toBe(8);
  });

  test('fails when a canonical path is missing on disk', () => {
    const missingPath = 'docs/knowledge/strategies/strategy-topic.md';
    const workspace = createWorkspace({
      skipContentPaths: [missingPath],
    });
    const result = validateKnowledgeRegister({
      rootDir: workspace.rootDir,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain(`canonicalPath "${missingPath}" does not exist on disk`);
  });

  test('fails when duplicate topic IDs are present', () => {
    const workspace = createWorkspace({
      mutateRows(rows) {
        rows[1].topicId = rows[0].topicId;
      },
    });
    const result = validateKnowledgeRegister({
      rootDir: workspace.rootDir,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain('duplicate topicId "orientation-topic"');
  });

  test('fails when retired numbered shelf paths are used', () => {
    const retiredPath = 'docs/knowledge/20-strategies/legacy-strategy-topic.md';
    const workspace = createWorkspace({
      mutateRows(rows) {
        rows[1].canonicalPath = retiredPath;
      },
      extraContentPaths: [retiredPath],
    });
    const result = validateKnowledgeRegister({
      rootDir: workspace.rootDir,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain(`canonicalPath "${retiredPath}" uses retired shelf path`);
  });

  test('fails when an unsupported family is used', () => {
    const workspace = createWorkspace({
      mutateRows(rows) {
        rows[0].family = 'legacy-core-language';
      },
    });
    const result = validateKnowledgeRegister({
      rootDir: workspace.rootDir,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain('unsupported family "legacy-core-language"');
  });

  test('provides clear line-based error messages', () => {
    const workspace = createWorkspace({
      mutateRows(rows) {
        rows[0].canonicalPath = '';
      },
    });
    const result = validateKnowledgeRegister({
      rootDir: workspace.rootDir,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain('line 2: missing required canonicalPath');
  });
});
