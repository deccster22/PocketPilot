const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  validateKnowledgeRuntimeCatalogSync,
} = require('../validate-knowledge-runtime-catalog');
const {
  RUNTIME_REQUIRED_REGISTER_TOPIC_IDS,
} = require('../knowledge-runtime-catalog-sync-config');

const tempRoots = [];

function writeFile(absolutePath, contents) {
  fs.mkdirSync(path.dirname(absolutePath), {
    recursive: true,
  });
  fs.writeFileSync(absolutePath, contents);
}

function quote(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function createRegisterCsv(topicIds) {
  const header = ['topicId', 'family', 'canonicalPath']
    .map((column) => quote(column))
    .join(',');
  const rows = topicIds.map((topicId) =>
    [topicId, 'orientation', `docs/knowledge/orientation/${topicId}.md`]
      .map((value) => quote(value))
      .join(','),
  );

  return [header, ...rows].join('\n');
}

function createCatalogSource(topicIds) {
  return `import type { KnowledgeCatalogEntry } from '@/services/knowledge/types';

export const knowledgeCatalog = [
${topicIds
  .map(
    (topicId) => `  {
    topicId: '${topicId}',
    title: '${topicId}',
    summary: '${topicId}',
    content: '${topicId}',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'orientation',
    priority: 'NOW',
    sections: [{ heading: 'Overview', body: ['${topicId}'] }],
    relatedTopicIds: [],
  }`,
  )
  .join(',\n')}
] satisfies ReadonlyArray<KnowledgeCatalogEntry>;
`;
}

function createWorkspace(params = {}) {
  const {
    registerTopicIds = ['required-a', 'required-b', 'docs-only-c'],
    runtimeCatalogTopicIds = ['required-a', 'required-b', 'legacy-only-x'],
  } = params;
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-knowledge-runtime-sync-'));
  tempRoots.push(rootDir);

  const registerPath = path.join(rootDir, 'docs', 'knowledge', '_register', 'CONTENT_REGISTER.csv');
  const catalogPath = path.join(rootDir, 'services', 'knowledge', 'knowledgeCatalog.ts');
  writeFile(registerPath, createRegisterCsv(registerTopicIds));
  writeFile(catalogPath, createCatalogSource(runtimeCatalogTopicIds));

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

describe('validateKnowledgeRuntimeCatalogSync', () => {
  test('default runtime-required topic scope includes all P7-K12 first-rollout IDs', () => {
    expect(RUNTIME_REQUIRED_REGISTER_TOPIC_IDS).toEqual(
      expect.arrayContaining([
        'glossary-stop-loss-price',
        'glossary-target-price',
        'glossary-risk-amount',
        'glossary-risk-percent',
        'glossary-guardrails',
        'trade-hub-stop-loss-price',
        'trade-hub-target-price',
        'trade-hub-risk-amount',
        'trade-hub-risk-percent',
        'trade-hub-guardrails',
      ]),
    );
  });

  test('passes when required register topics resolve in runtime catalog and legacy runtime IDs are explicitly allowlisted', () => {
    const workspace = createWorkspace();
    const result = validateKnowledgeRuntimeCatalogSync({
      rootDir: workspace.rootDir,
      requiredRegisterTopicIds: ['required-a', 'required-b'],
      allowedUnregisteredRuntimeTopicIds: ['legacy-only-x'],
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.docsOnlyRegisterTopicCount).toBe(1);
  });

  test('fails when a required register topic is missing from runtime catalog', () => {
    const workspace = createWorkspace({
      runtimeCatalogTopicIds: ['required-a', 'legacy-only-x'],
    });
    const result = validateKnowledgeRuntimeCatalogSync({
      rootDir: workspace.rootDir,
      requiredRegisterTopicIds: ['required-a', 'required-b'],
      allowedUnregisteredRuntimeTopicIds: ['legacy-only-x'],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain(
      'runtime catalog missing required registered topic IDs: required-b',
    );
  });

  test('fails when a required runtime topic ID is missing from register', () => {
    const workspace = createWorkspace({
      registerTopicIds: ['required-a', 'docs-only-c'],
    });
    const result = validateKnowledgeRuntimeCatalogSync({
      rootDir: workspace.rootDir,
      requiredRegisterTopicIds: ['required-a', 'required-b'],
      allowedUnregisteredRuntimeTopicIds: ['legacy-only-x'],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain(
      'runtime-required register topic IDs missing from CONTENT_REGISTER.csv: required-b',
    );
  });

  test('fails when runtime catalog contains duplicate topic IDs', () => {
    const workspace = createWorkspace({
      runtimeCatalogTopicIds: ['required-a', 'required-a', 'required-b', 'legacy-only-x'],
    });
    const result = validateKnowledgeRuntimeCatalogSync({
      rootDir: workspace.rootDir,
      requiredRegisterTopicIds: ['required-a', 'required-b'],
      allowedUnregisteredRuntimeTopicIds: ['legacy-only-x'],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain('runtime catalog duplicate topicId "required-a"');
  });

  test('fails when runtime catalog includes unexpected unregistered IDs', () => {
    const workspace = createWorkspace({
      runtimeCatalogTopicIds: ['required-a', 'required-b', 'rogue-runtime-topic'],
    });
    const result = validateKnowledgeRuntimeCatalogSync({
      rootDir: workspace.rootDir,
      requiredRegisterTopicIds: ['required-a', 'required-b'],
      allowedUnregisteredRuntimeTopicIds: [],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain(
      'runtime catalog contains unregistered topic IDs not in explicit legacy allowlist: rogue-runtime-topic',
    );
  });
});
