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

  test('default runtime-required topic scope includes all P7-K19 first-wave evidence IDs', () => {
    expect(RUNTIME_REQUIRED_REGISTER_TOPIC_IDS).toEqual(
      expect.arrayContaining([
        'evidence-trend-follow-bitcoin-above-the-old-high-worked',
        'evidence-trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution',
        'evidence-breakout-watcher-bitcoin-above-the-old-high-worked',
        'evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution',
        'evidence-buy-the-dip-bitcoin-above-the-old-high-worked',
        'evidence-buy-the-dip-bitcoin-june-to-august-2022-caution',
      ]),
    );
  });

  test('default runtime-required topic scope includes all P7-K21 first-wave concept IDs', () => {
    expect(RUNTIME_REQUIRED_REGISTER_TOPIC_IDS).toEqual(
      expect.arrayContaining([
        'concept-trend',
        'concept-breakout',
        'concept-support',
        'concept-resistance',
        'concept-reversion',
      ]),
    );
  });

  test('default runtime-required topic scope keeps held concept IDs out of K21 required list', () => {
    [
      'concept-momentum',
      'concept-confluence',
      'concept-volatility',
      'concept-fibonacci-levels',
      'concept-candlestick-patterns',
    ].forEach((topicId) => {
      expect(RUNTIME_REQUIRED_REGISTER_TOPIC_IDS).not.toContain(topicId);
    });
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

  test('fails when one first-wave evidence required ID is missing from runtime catalog', () => {
    const firstWave = [
      'evidence-trend-follow-bitcoin-above-the-old-high-worked',
      'evidence-trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution',
      'evidence-breakout-watcher-bitcoin-above-the-old-high-worked',
      'evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution',
      'evidence-buy-the-dip-bitcoin-above-the-old-high-worked',
      'evidence-buy-the-dip-bitcoin-june-to-august-2022-caution',
    ];
    const workspace = createWorkspace({
      registerTopicIds: [...firstWave],
      runtimeCatalogTopicIds: firstWave.filter(
        (topicId) =>
          topicId !== 'evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution',
      ),
    });
    const result = validateKnowledgeRuntimeCatalogSync({
      rootDir: workspace.rootDir,
      requiredRegisterTopicIds: [...firstWave],
      allowedUnregisteredRuntimeTopicIds: [],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain(
      'runtime catalog missing required registered topic IDs: evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution',
    );
  });

  test('fails when one first-wave concept required ID is missing from runtime catalog', () => {
    const firstWaveConceptIds = [
      'concept-trend',
      'concept-breakout',
      'concept-support',
      'concept-resistance',
      'concept-reversion',
    ];
    const workspace = createWorkspace({
      registerTopicIds: [...firstWaveConceptIds],
      runtimeCatalogTopicIds: firstWaveConceptIds.filter(
        (topicId) => topicId !== 'concept-reversion',
      ),
    });
    const result = validateKnowledgeRuntimeCatalogSync({
      rootDir: workspace.rootDir,
      requiredRegisterTopicIds: [...firstWaveConceptIds],
      allowedUnregisteredRuntimeTopicIds: [],
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.join('\n')).toContain(
      'runtime catalog missing required registered topic IDs: concept-reversion',
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
