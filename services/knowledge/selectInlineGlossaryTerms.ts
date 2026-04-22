import { createGlossaryTermIndex } from '@/services/knowledge/createGlossaryTermIndex';
import type { GlossaryMatch, InlineGlossarySurface, KnowledgeCatalogEntry } from '@/services/knowledge/types';

export type InlineGlossaryTermCandidate = {
  start: number;
  end: number;
  text: string;
  topicId: string;
  canonicalTerm: string;
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

function overlaps(
  candidate: Pick<InlineGlossaryTermCandidate, 'start' | 'end'>,
  existing: ReadonlyArray<InlineGlossaryTermCandidate>,
): boolean {
  return existing.some(
    (match) => candidate.start < match.end && candidate.end > match.start,
  );
}

function toGlossaryMatch(params: {
  text: string;
  topicId: string;
  canonicalTerm: string;
}): GlossaryMatch {
  return {
    topicId: params.topicId,
    canonicalTerm: params.canonicalTerm,
    matchedText: params.text,
  };
}

export function selectInlineGlossaryTerms(params: {
  surface: InlineGlossarySurface;
  text: string;
  nodes: ReadonlyArray<KnowledgeCatalogEntry>;
}): InlineGlossaryTermSelection {
  const text = params.text.trim();

  if (!text) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    };
  }

  const index = createGlossaryTermIndex({
    surface: params.surface,
    nodes: params.nodes,
  });

  if (index.status === 'UNAVAILABLE') {
    return index;
  }

  const matches = index.index.matchers
    .map((matcher) => {
      const match = matcher.regex.exec(text);

      if (!match || typeof match.index !== 'number') {
        return null;
      }

      return {
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        topicId: matcher.topicId,
        canonicalTerm: matcher.canonicalTerm,
        order: matcher.order,
      } satisfies InlineGlossaryTermCandidate & { order: number };
    })
    .filter((value): value is InlineGlossaryTermCandidate & { order: number } => value !== null)
    .sort((left, right) => {
      if (left.start !== right.start) {
        return left.start - right.start;
      }

      const leftLength = left.end - left.start;
      const rightLength = right.end - right.start;

      if (leftLength !== rightLength) {
        return rightLength - leftLength;
      }

      return left.order - right.order;
    });

  const matchedTopicIds = new Set<string>();
  const candidates: InlineGlossaryTermCandidate[] = [];

  for (const match of matches) {
    if (candidates.length >= index.index.maxTerms) {
      break;
    }

    if (matchedTopicIds.has(match.topicId) || overlaps(match, candidates)) {
      continue;
    }

    const glossaryMatch = toGlossaryMatch({
      text: match.text,
      topicId: match.topicId,
      canonicalTerm: match.canonicalTerm,
    });

    candidates.push({
      start: match.start,
      end: match.end,
      text: glossaryMatch.matchedText,
      topicId: glossaryMatch.topicId,
      canonicalTerm: glossaryMatch.canonicalTerm,
    });
    matchedTopicIds.add(match.topicId);
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
