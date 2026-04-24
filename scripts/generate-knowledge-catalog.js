const fs = require('node:fs');
const path = require('node:path');
const { DOC_FAMILY_ORDER, DOC_TO_RUNTIME_FAMILY } = require('./knowledge-catalog-config');

const ROOT = process.cwd();
const REGISTER_PATH = path.join(ROOT, 'docs', 'knowledge', '_register', 'CONTENT_REGISTER.csv');
const OUTPUT_PATH = path.join(ROOT, 'services', 'knowledge', 'knowledgeCatalog.ts');

const PRIORITY_MAP = {
  now: 'NOW',
  next: 'NEXT',
  later: 'LATER',
};

const DIFFICULTY_MAP = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED',
};

const MEDIA_TYPE_MAP = {
  article: 'ARTICLE',
  diagram: 'DIAGRAM',
  video: 'VIDEO',
  interactive: 'INTERACTIVE',
  case_study: 'CASE_STUDY',
  'case study': 'CASE_STUDY',
};

const TEXT_REPLACEMENTS = [
  [/â€™/g, "'"],
  [/â€˜/g, "'"],
  [/â€œ/g, '"'],
  [/â€/g, '"'],
  [/â€“/g, '-'],
  [/â€”/g, '-'],
  [/â€¦/g, '...'],
  [/Â/g, ''],
  [/[’‘]/g, "'"],
  [/[“”]/g, '"'],
  [/[–—]/g, '-'],
  [/…/g, '...'],
  [/\u00a0/g, ' '],
];

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

  const [header, ...dataRows] = rows;

  return dataRows
    .filter((candidate) => candidate.some((value) => value.trim().length > 0))
    .map((candidate) =>
      Object.fromEntries(header.map((key, index) => [key, candidate[index] ?? ''])),
    );
}

function normalizeText(value) {
  let normalized = value;

  TEXT_REPLACEMENTS.forEach(([pattern, replacement]) => {
    normalized = normalized.replace(pattern, replacement);
  });

  normalized = normalized
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

function normalizeHeading(value) {
  return normalizeText(value).replace(/^\d+\.\s+/, '');
}

function normalizeLookupKey(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function stripFrontMatter(source) {
  const normalized = source.replace(/\r\n/g, '\n');

  if (!normalized.startsWith('---\n')) {
    return normalized;
  }

  const closingBoundary = normalized.indexOf('\n---\n', 4);

  if (closingBoundary < 0) {
    return normalized;
  }

  return normalized.slice(closingBoundary + 5);
}

function parseMarkdownSections(source) {
  const body = stripFrontMatter(source);
  const lines = body.split('\n');
  const sections = [];
  let currentSection = null;
  let paragraphLines = [];

  function flushParagraph() {
    if (!currentSection || paragraphLines.length === 0) {
      paragraphLines = [];
      return;
    }

    const paragraph = normalizeText(paragraphLines.join(' '));

    if (paragraph.length > 0) {
      currentSection.body.push(paragraph);
    }

    paragraphLines = [];
  }

  function beginSection(rawHeading) {
    flushParagraph();

    const heading = normalizeHeading(rawHeading);

    currentSection = {
      heading,
      body: [],
    };

    sections.push(currentSection);
  }

  lines.forEach((line) => {
    if (/^#\s+/.test(line)) {
      flushParagraph();
      return;
    }

    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);

    if (headingMatch) {
      beginSection(headingMatch[1]);
      return;
    }

    if (/^\s*-\s+/.test(line)) {
      flushParagraph();

      if (!currentSection) {
        beginSection('Overview');
      }

      const bullet = normalizeText(line.replace(/^\s*-\s+/, ''));

      if (bullet.length > 0) {
        currentSection.body.push(bullet);
      }

      return;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      return;
    }

    if (!currentSection) {
      beginSection('Overview');
    }

    paragraphLines.push(line.trim());
  });

  flushParagraph();

  return sections.filter((section) => section.heading.length > 0 && section.body.length > 0);
}

function formatSectionHeading(heading) {
  if (heading === 'Quick version') {
    return 'Overview';
  }

  if (heading === 'Full version') {
    return 'Deeper context';
  }

  return heading;
}

function buildPreparedSections(rawSections) {
  const preparedSections = [];
  const seenHeadings = new Set();

  rawSections.forEach((section) => {
    const heading = formatSectionHeading(section.heading);
    const lookupKey = normalizeLookupKey(heading);

    if (lookupKey === 'further reading' || seenHeadings.has(lookupKey)) {
      return;
    }

    seenHeadings.add(lookupKey);
    preparedSections.push({
      heading,
      body: section.body,
    });
  });

  return preparedSections;
}

function buildContent(sections) {
  return sections
    .flatMap((section) => [section.heading, ...section.body])
    .join('\n\n')
    .trim();
}

function toDifficulty(value) {
  const difficulty = DIFFICULTY_MAP[value.trim().toLowerCase()];

  if (!difficulty) {
    throw new Error(`Unsupported difficulty value: ${value}`);
  }

  return difficulty;
}

function toMediaType(value) {
  const mediaType = MEDIA_TYPE_MAP[value.trim().toLowerCase()];

  if (!mediaType) {
    throw new Error(`Unsupported media type value: ${value}`);
  }

  return mediaType;
}

function toPriority(value) {
  const priority = PRIORITY_MAP[value.trim().toLowerCase()];

  if (!priority) {
    throw new Error(`Unsupported priority value: ${value}`);
  }

  return priority;
}

function toRuntimeFamily(value) {
  const runtimeFamily = DOC_TO_RUNTIME_FAMILY[value.trim().toLowerCase()];

  if (!runtimeFamily) {
    throw new Error(`Unsupported docs family value: ${value}`);
  }

  return runtimeFamily;
}

function sortCatalog(entries) {
  return [...entries].sort((left, right) => {
    const familyDelta =
      DOC_FAMILY_ORDER.indexOf(left.family) - DOC_FAMILY_ORDER.indexOf(right.family);

    if (familyDelta !== 0) {
      return familyDelta;
    }

    return left.title.localeCompare(right.title);
  });
}

function main() {
  const register = parseCsv(fs.readFileSync(REGISTER_PATH, 'utf8'));
  const entries = register.map((row) => {
    const markdownPath = path.join(ROOT, row.canonicalPath);
    const rawSections = parseMarkdownSections(fs.readFileSync(markdownPath, 'utf8'));
    const preparedSections = buildPreparedSections(rawSections);
    const relatedSection = rawSections.find(
      (section) => normalizeLookupKey(section.heading) === 'further reading',
    );
    const summary = normalizeText(row.summary) || preparedSections[0]?.body[0] || row.title;

    return {
      topicId: row.topicId,
      title: normalizeText(row.title),
      summary,
      content: buildContent(preparedSections),
      mediaType: toMediaType(row.mediaType),
      difficulty: toDifficulty(row.difficulty),
      strategyLinks: [],
      signalLinks: [],
      eventTypeLinks: [],
      family: row.family.trim().toLowerCase(),
      priority: toPriority(row.priority),
      sections: preparedSections,
      relatedTopicTitles: relatedSection ? relatedSection.body : [],
      relatedTopicIds: [],
    };
  });

  const titleToTopicId = new Map(
    entries.map((entry) => [normalizeLookupKey(entry.title), entry.topicId]),
  );

  const catalog = sortCatalog(entries).map((entry) => {
    const relatedTopicIds = entry.relatedTopicTitles
      .map((title) => titleToTopicId.get(normalizeLookupKey(title)) ?? null)
      .filter((topicId) => topicId && topicId !== entry.topicId);

    return {
      topicId: entry.topicId,
      title: entry.title,
      summary: entry.summary,
      content: entry.content,
      mediaType: entry.mediaType,
      difficulty: entry.difficulty,
      strategyLinks: entry.strategyLinks,
      signalLinks: entry.signalLinks,
      eventTypeLinks: entry.eventTypeLinks,
      family: toRuntimeFamily(entry.family),
      priority: entry.priority,
      sections: entry.sections,
      relatedTopicIds,
    };
  });

  const output = `import type { KnowledgeCatalogEntry } from '@/services/knowledge/types';

export const knowledgeCatalog = ${JSON.stringify(catalog, null, 2)} satisfies ReadonlyArray<KnowledgeCatalogEntry>;
`;

  fs.writeFileSync(OUTPUT_PATH, output);
  process.stdout.write(
    `Generated knowledge catalog with ${catalog.length} topics at ${path.relative(ROOT, OUTPUT_PATH)}\n`,
  );
}

main();
