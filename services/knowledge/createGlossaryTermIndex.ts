import type {
  GlossaryTermVariant,
  InlineGlossarySurface,
  KnowledgeCatalogEntry,
} from '@/services/knowledge/types';

type GlossaryTopicRule = {
  topicId: string;
  canonicalTerm: string;
  aliases?: ReadonlyArray<string>;
};

type GlossarySurfaceRule = {
  maxTerms: number;
  topics: ReadonlyArray<GlossaryTopicRule>;
};

export type GlossaryTermMatcher = {
  topicId: string;
  canonicalTerm: string;
  matchTerm: string;
  regex: RegExp;
  order: number;
};

export type GlossaryTermIndex = {
  maxTerms: number;
  variants: ReadonlyArray<GlossaryTermVariant>;
  matchers: ReadonlyArray<GlossaryTermMatcher>;
};

export type GlossaryTermIndexAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ELIGIBLE_TERMS' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      index: GlossaryTermIndex;
    };

const SURFACE_RULES: Readonly<Record<InlineGlossarySurface, GlossarySurfaceRule>> = {
  DASHBOARD_EXPLANATION: {
    maxTerms: 2,
    topics: [
      {
        topicId: 'pp-what-strategy-status-means',
        canonicalTerm: 'Strategy Status',
        aliases: ['strategy status'],
      },
      {
        topicId: 'pp-what-a-marketevent-is',
        canonicalTerm: 'MarketEvent',
        aliases: ['market event'],
      },
      {
        topicId: 'strategy-momentum-pulse',
        canonicalTerm: 'Momentum',
        aliases: ['momentum'],
      },
      {
        topicId: 'pp-estimated-vs-confirmed-context',
        canonicalTerm: 'Estimated vs Confirmed',
        aliases: ['estimated', 'confirmed'],
      },
    ],
  },
  TRADE_HUB_SAFETY: {
    maxTerms: 1,
    topics: [
      {
        topicId: 'pp-what-trade-hub-is-for',
        canonicalTerm: 'Trade Hub',
        aliases: ['trade hub'],
      },
      {
        topicId: 'pp-what-protection-plans-are-for',
        canonicalTerm: 'Protection Plans',
        aliases: ['protection plan', 'protection plans'],
      },
    ],
  },
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normaliseMatchTerm(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function extractTopicTitleTerm(title: string): string | null {
  const withoutPrefix = title.trim().replace(/^what\s+(?:a|an|the)\s+/i, '');
  const withoutSuffix = withoutPrefix
    .replace(/\s+is\s+for$/i, '')
    .replace(/\s+are\s+for$/i, '')
    .replace(/\s+means$/i, '')
    .replace(/\s+is$/i, '')
    .trim();
  return withoutSuffix.length > 0 ? withoutSuffix : null;
}

function createMatcherRegex(matchTerm: string): RegExp | null {
  const tokens = matchTerm.split(' ').filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return null;
  }

  const body = tokens.map((token) => escapeRegex(token)).join('(?:\\s|[-_/])*');
  return new RegExp(`\\b${body}\\b`, 'i');
}

function createGlossaryVariant(params: {
  node: KnowledgeCatalogEntry;
  rule: GlossaryTopicRule;
}): GlossaryTermVariant | null {
  const rawTerms = [
    params.rule.canonicalTerm,
    ...(params.rule.aliases ?? []),
    extractTopicTitleTerm(params.node.title),
  ];
  const seen = new Set<string>();
  const matchTerms: string[] = [];

  rawTerms.forEach((rawTerm) => {
    if (typeof rawTerm !== 'string') {
      return;
    }

    const normalised = normaliseMatchTerm(rawTerm);

    if (normalised.length < 3 || seen.has(normalised)) {
      return;
    }

    seen.add(normalised);
    matchTerms.push(normalised);
  });

  if (matchTerms.length === 0) {
    return null;
  }

  return {
    topicId: params.rule.topicId,
    canonicalTerm: params.rule.canonicalTerm,
    matchTerms,
  };
}

export function createGlossaryTermIndex(params: {
  surface: InlineGlossarySurface;
  nodes: ReadonlyArray<KnowledgeCatalogEntry>;
}): GlossaryTermIndexAvailability {
  const surfaceRule = SURFACE_RULES[params.surface];

  if (!surfaceRule) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  const nodeByTopicId = new Map(params.nodes.map((node) => [node.topicId, node]));
  const variants: GlossaryTermVariant[] = [];
  const matchers: GlossaryTermMatcher[] = [];
  let order = 0;

  surfaceRule.topics.forEach((rule) => {
    const node = nodeByTopicId.get(rule.topicId);

    if (!node) {
      return;
    }

    const variant = createGlossaryVariant({
      node,
      rule,
    });

    if (!variant) {
      return;
    }

    variants.push(variant);
    variant.matchTerms.forEach((matchTerm) => {
      const regex = createMatcherRegex(matchTerm);

      if (!regex) {
        return;
      }

      matchers.push({
        topicId: variant.topicId,
        canonicalTerm: variant.canonicalTerm,
        matchTerm,
        regex,
        order,
      });
      order += 1;
    });
  });

  if (matchers.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    };
  }

  return {
    status: 'AVAILABLE',
    index: {
      maxTerms: surfaceRule.maxTerms,
      variants,
      matchers,
    },
  };
}
