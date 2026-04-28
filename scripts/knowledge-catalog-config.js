const SUPPORTED_REGISTER_FAMILIES = Object.freeze([
  'orientation',
  'strategies',
  'concepts',
  'glossary',
  'trade-hub',
  'interpretation',
  'market-examples',
  'action-risk',
  'evidence',
  'reflection',
  'knowledge-system',
]);

const REQUIRED_CORE_FAMILIES = Object.freeze([
  'orientation',
  'strategies',
  'concepts',
  'glossary',
  'trade-hub',
  'interpretation',
  'market-examples',
  'action-risk',
]);

const DOC_FAMILY_ORDER = Object.freeze([
  'orientation',
  'strategies',
  'concepts',
  'glossary',
  'trade-hub',
  'interpretation',
  'market-examples',
  'action-risk',
  'evidence',
  'reflection',
  'knowledge-system',
]);

const FAMILY_PATH_PREFIXES = Object.freeze({
  orientation: 'docs/knowledge/orientation/',
  strategies: 'docs/knowledge/strategies/',
  concepts: 'docs/knowledge/concepts/',
  glossary: 'docs/knowledge/glossary/',
  'trade-hub': 'docs/knowledge/trade-hub/',
  interpretation: 'docs/knowledge/interpretation/',
  'market-examples': 'docs/knowledge/market-examples/',
  'action-risk': 'docs/knowledge/action-risk/',
  evidence: 'docs/knowledge/evidence/',
  reflection: 'docs/knowledge/40-reflection/',
  'knowledge-system': 'docs/knowledge/50-knowledge-system/',
});

const RETIRED_SHELF_PREFIXES = Object.freeze([
  'docs/knowledge/00-orientation/',
  'docs/knowledge/10-core-language/',
  'docs/knowledge/20-strategies/',
  'docs/knowledge/30-action-risk/',
]);

const DOC_TO_RUNTIME_FAMILY = Object.freeze({
  orientation: 'orientation',
  strategies: 'strategies',
  concepts: 'core-language',
  glossary: 'core-language',
  'trade-hub': 'action-risk',
  interpretation: 'core-language',
  'market-examples': 'core-language',
  'action-risk': 'action-risk',
  evidence: 'core-language',
  reflection: 'reflection',
  'knowledge-system': 'knowledge-system',
});

function getMissingValues(source, expected) {
  return source.filter((value) => !expected.includes(value));
}

function assertConfigConsistency() {
  const orderWithoutSupported = getMissingValues(DOC_FAMILY_ORDER, SUPPORTED_REGISTER_FAMILIES);
  const supportedWithoutOrder = getMissingValues(SUPPORTED_REGISTER_FAMILIES, DOC_FAMILY_ORDER);
  const pathKeys = Object.keys(FAMILY_PATH_PREFIXES);
  const mappingKeys = Object.keys(DOC_TO_RUNTIME_FAMILY);
  const supportedWithoutPath = getMissingValues(SUPPORTED_REGISTER_FAMILIES, pathKeys);
  const pathWithoutSupported = getMissingValues(pathKeys, SUPPORTED_REGISTER_FAMILIES);
  const supportedWithoutMapping = getMissingValues(SUPPORTED_REGISTER_FAMILIES, mappingKeys);
  const mappingWithoutSupported = getMissingValues(mappingKeys, SUPPORTED_REGISTER_FAMILIES);

  const issues = [
    ...orderWithoutSupported.map(
      (value) => `DOC_FAMILY_ORDER includes unsupported family "${value}"`,
    ),
    ...supportedWithoutOrder.map(
      (value) => `SUPPORTED_REGISTER_FAMILIES is missing from DOC_FAMILY_ORDER: "${value}"`,
    ),
    ...supportedWithoutPath.map(
      (value) => `SUPPORTED_REGISTER_FAMILIES is missing path prefix mapping: "${value}"`,
    ),
    ...pathWithoutSupported.map(
      (value) => `FAMILY_PATH_PREFIXES includes unsupported family "${value}"`,
    ),
    ...supportedWithoutMapping.map(
      (value) => `SUPPORTED_REGISTER_FAMILIES is missing runtime mapping: "${value}"`,
    ),
    ...mappingWithoutSupported.map(
      (value) => `DOC_TO_RUNTIME_FAMILY includes unsupported family "${value}"`,
    ),
  ];

  if (issues.length > 0) {
    throw new Error(`Invalid knowledge catalog config:\n- ${issues.join('\n- ')}`);
  }
}

assertConfigConsistency();

module.exports = {
  SUPPORTED_REGISTER_FAMILIES,
  REQUIRED_CORE_FAMILIES,
  DOC_FAMILY_ORDER,
  FAMILY_PATH_PREFIXES,
  RETIRED_SHELF_PREFIXES,
  DOC_TO_RUNTIME_FAMILY,
};
