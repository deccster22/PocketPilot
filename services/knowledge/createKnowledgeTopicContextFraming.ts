import type {
  ContextualKnowledgeLinkageReason,
  KnowledgeTopicContextFramingAvailability,
  KnowledgeTopicContextFramingReason,
  KnowledgeTopicContextOrigin,
} from '@/services/knowledge/types';

function createSurfaceLabel(originSurface: 'DASHBOARD' | 'TRADE_HUB'): string {
  switch (originSurface) {
    case 'DASHBOARD':
      return 'Dashboard';
    default:
      return 'Trade Hub';
  }
}

function createContextLabel(originSurface: 'DASHBOARD' | 'TRADE_HUB'): string {
  return originSurface === 'DASHBOARD' ? 'contextual frame' : 'action-support frame';
}

function createLinkageReasons(
  linkageReason: ContextualKnowledgeLinkageReason,
): ReadonlyArray<KnowledgeTopicContextFramingReason> {
  switch (linkageReason) {
    case 'STRATEGY':
      return ['STRATEGY'];
    case 'SIGNAL':
      return ['SIGNAL'];
    case 'EVENT':
      return ['EVENT'];
    case 'SURFACE_CONTEXT':
      return ['SURFACE_CONTEXT'];
    default:
      return ['STRATEGY', 'SIGNAL', 'EVENT', 'SURFACE_CONTEXT'];
  }
}

export function createKnowledgeTopicContextFraming(params: {
  contextualOrigin?: KnowledgeTopicContextOrigin | null;
}): KnowledgeTopicContextFramingAvailability {
  const contextualOrigin = params.contextualOrigin;

  if (!contextualOrigin || contextualOrigin.originSurface === 'NONE') {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_CONTEXTUAL_ORIGIN',
    };
  }

  if (
    contextualOrigin.originSurface !== 'DASHBOARD' &&
    contextualOrigin.originSurface !== 'TRADE_HUB'
  ) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (contextualOrigin.linkageReason === null) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_CONTEXTUAL_ORIGIN',
    };
  }

  return {
    status: 'AVAILABLE',
    framing: {
      title: 'Why this topic is here',
      summary: `Opened from ${createSurfaceLabel(
        contextualOrigin.originSurface,
      )}, so the detail view keeps the same calm ${createContextLabel(
        contextualOrigin.originSurface,
      )} rather than becoming a separate surface of its own.`,
      originSurface: contextualOrigin.originSurface,
      linkageReasons: createLinkageReasons(contextualOrigin.linkageReason),
    },
  };
}
