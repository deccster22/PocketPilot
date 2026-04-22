import type { UserProfile } from '@/core/profile/types';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import {
  createInlineGlossaryAcknowledgementKey,
  defaultInlineGlossarySeenState,
  type InlineGlossarySeenState,
} from '@/services/knowledge/inlineGlossarySeenState';
import {
  selectInlineGlossaryTerms,
  type InlineGlossaryTermCandidate,
} from '@/services/knowledge/selectInlineGlossaryTerms';
import type {
  InlineGlossaryAvailability,
  InlineGlossaryBlock,
  InlineGlossarySegment,
  InlineGlossarySurface,
  KnowledgeCatalogEntry,
} from '@/services/knowledge/types';

const MAX_LINKED_TERMS_BY_PROFILE: Readonly<Record<UserProfile, number>> = {
  BEGINNER: 2,
  MIDDLE: 1,
  ADVANCED: 0,
};

function toSegments(params: {
  text: string;
  candidates: ReadonlyArray<InlineGlossaryTermCandidate>;
  linkedTopicIds: ReadonlySet<string>;
  profile: UserProfile;
  surface: InlineGlossarySurface;
  accountId?: string | null;
  seenState: InlineGlossarySeenState;
}): InlineGlossaryBlock {
  const segments: InlineGlossarySegment[] = [];
  const acknowledgementKeys: string[] = [];
  let cursor = 0;

  params.candidates.forEach((candidate) => {
    if (candidate.start > cursor) {
      segments.push({
        kind: 'TEXT',
        text: params.text.slice(cursor, candidate.start),
      });
    }

    const acknowledgementKey = createInlineGlossaryAcknowledgementKey({
      accountId: params.accountId,
      profile: params.profile,
      surface: params.surface,
      topicId: candidate.topicId,
    });
    const alreadyAcknowledged = params.seenState.hasAcknowledged(acknowledgementKey);
    const renderMode =
      !alreadyAcknowledged && params.linkedTopicIds.has(candidate.topicId) ? 'LINKED' : 'PLAIN';

    if (renderMode === 'LINKED') {
      acknowledgementKeys.push(acknowledgementKey);
    }

    segments.push({
      kind: 'GLOSSARY_TERM',
      text: params.text.slice(candidate.start, candidate.end),
      topicId: candidate.topicId,
      acknowledgementKey,
      renderMode,
    });
    cursor = candidate.end;
  });

  if (cursor < params.text.length) {
    segments.push({
      kind: 'TEXT',
      text: params.text.slice(cursor),
    });
  }

  return {
    segments,
    acknowledgementKeys,
  };
}

export function createInlineGlossaryHelp(params: {
  profile: UserProfile;
  surface: InlineGlossarySurface;
  text: string;
  accountId?: string | null;
  nodes?: ReadonlyArray<KnowledgeCatalogEntry>;
  seenState?: InlineGlossarySeenState;
}): InlineGlossaryAvailability {
  const maxLinkedTerms = MAX_LINKED_TERMS_BY_PROFILE[params.profile];

  if (maxLinkedTerms <= 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_PROFILE',
    };
  }

  const nodes = params.nodes ?? knowledgeCatalog;
  const selection = selectInlineGlossaryTerms({
    surface: params.surface,
    text: params.text,
    nodes,
  });

  if (selection.status === 'UNAVAILABLE') {
    return selection;
  }

  const linkedTopicIds = new Set<string>();
  const seenState = params.seenState ?? defaultInlineGlossarySeenState;

  selection.candidates.forEach((candidate) => {
    if (linkedTopicIds.size >= maxLinkedTerms) {
      return;
    }

    const acknowledgementKey = createInlineGlossaryAcknowledgementKey({
      accountId: params.accountId,
      profile: params.profile,
      surface: params.surface,
      topicId: candidate.topicId,
    });

    if (!seenState.hasAcknowledged(acknowledgementKey)) {
      linkedTopicIds.add(candidate.topicId);
    }
  });

  return {
    status: 'AVAILABLE',
    block: toSegments({
      text: params.text,
      candidates: selection.candidates,
      linkedTopicIds,
      profile: params.profile,
      surface: params.surface,
      accountId: params.accountId,
      seenState,
    }),
  };
}
