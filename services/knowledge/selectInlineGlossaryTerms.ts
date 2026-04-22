import type {
  InlineGlossarySurface,
  KnowledgeCatalogEntry,
} from '@/services/knowledge/types';

type InlineGlossaryTermRule = {
  term: string;
  topicId: string;
};

export type InlineGlossaryTermCandidate = {
  start: number;
  end: number;
  text: string;
  topicId: string;
};

export type InlineGlossaryTermSelection =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ELIGIBLE_TERMS' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      candidates: ReadonlyArray<InlineGlossaryTermCandidate>;
    };

const SURFACE_RULES: Readonly<
  Record<
    InlineGlossarySurface,
    {
      maxTerms: number;
      terms: ReadonlyArray<InlineGlossaryTermRule>;
    }
  >
> = {
  DASHBOARD_EXPLANATION: {
    maxTerms: 2,
    terms: [
      {
        term: 'strategy status',
        topicId: 'pp-what-strategy-status-means',
      },
      {
        term: 'MarketEvent',
        topicId: 'pp-what-a-marketevent-is',
      },
      {
        term: 'market event',
        topicId: 'pp-what-a-marketevent-is',
      },
      {
        term: 'momentum',
        topicId: 'strategy-momentum-pulse',
      },
      {
        term: 'estimated',
        topicId: 'pp-estimated-vs-confirmed-context',
      },
      {
        term: 'confirmed',
        topicId: 'pp-estimated-vs-confirmed-context',
      },
    ],
  },
  TRADE_HUB_SAFETY: {
    maxTerms: 1,
    terms: [
      {
        term: 'Trade Hub',
        topicId: 'pp-what-trade-hub-is-for',
      },
      {
        term: 'ProtectionPlan',
        topicId: 'pp-what-protection-plans-are-for',
      },
      {
        term: 'Protection Plan',
        topicId: 'pp-what-protection-plans-are-for',
      },
      {
        term: 'confirmation',
        topicId: 'pp-what-trade-hub-is-for',
      },
    ],
  },
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createTermRegex(term: string): RegExp {
  const escaped = escapeRegex(term.trim()).replace(/\s+/g, '\\s+');
  return new RegExp(`\\b${escaped}\\b`, 'i');
}

function overlaps(
  candidate: Pick<InlineGlossaryTermCandidate, 'start' | 'end'>,
  existing: ReadonlyArray<InlineGlossaryTermCandidate>,
): boolean {
  return existing.some(
    (match) => candidate.start < match.end && candidate.end > match.start,
  );
}

export function selectInlineGlossaryTerms(params: {
  surface: InlineGlossarySurface;
  text: string;
  nodes: ReadonlyArray<KnowledgeCatalogEntry>;
}): InlineGlossaryTermSelection {
  const ruleSet = SURFACE_RULES[params.surface];

  if (!ruleSet) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  const text = params.text.trim();

  if (!text) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    };
  }

  const availableTopicIds = new Set(params.nodes.map((node) => node.topicId));
  const matchedTopicIds = new Set<string>();
  const candidates: InlineGlossaryTermCandidate[] = [];

  for (const termRule of ruleSet.terms) {
    if (candidates.length >= ruleSet.maxTerms) {
      break;
    }

    if (!availableTopicIds.has(termRule.topicId) || matchedTopicIds.has(termRule.topicId)) {
      continue;
    }

    const regex = createTermRegex(termRule.term);
    const match = regex.exec(text);

    if (!match || typeof match.index !== 'number') {
      continue;
    }

    const candidate = {
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
      topicId: termRule.topicId,
    } satisfies InlineGlossaryTermCandidate;

    if (overlaps(candidate, candidates)) {
      continue;
    }

    candidates.push(candidate);
    matchedTopicIds.add(termRule.topicId);
  }

  if (candidates.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    };
  }

  return {
    status: 'AVAILABLE',
    candidates: [...candidates].sort((left, right) => left.start - right.start),
  };
}
