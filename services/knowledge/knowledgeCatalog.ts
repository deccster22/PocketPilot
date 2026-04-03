import type { KnowledgeNode } from '@/services/knowledge/types';

export const knowledgeCatalog = [
  {
    topicId: 'how-pocketpilot-thinks',
    title: 'How PocketPilot thinks',
    summary:
      'PocketPilot turns interpreted market events into calmer surfaces instead of a raw market feed.',
    content:
      'PocketPilot begins with market context, strategy signals, and event interpretation, then shapes that into Snapshot, Dashboard, and Trade Hub views. The product is designed to reduce noise, stay honest about uncertainty, and keep decisions with the user rather than with the interface.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: ['data_quality', 'momentum_basics', 'dip_buying'],
    signalLinks: ['signal-breakout', 'signal-dip-window', 'signal-estimated-price'],
    eventTypeLinks: ['DATA_QUALITY', 'MOMENTUM_BUILDING', 'DIP_DETECTED'],
  },
  {
    topicId: 'estimated-vs-confirmed-context',
    title: 'Estimated and confirmed context',
    summary:
      'Estimated inputs stay usable, but PocketPilot labels them clearly so the surface does not read as settled fact.',
    content:
      'Some inputs arrive with less certainty than others. PocketPilot keeps those inputs visible when they still add orientation value, but it marks them as estimated and avoids presenting them as confirmed. That keeps the product useful without pretending the context is firmer than it is.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: ['data_quality', 'snapshot_change'],
    signalLinks: ['signal-estimated-price', 'signal-partial-coverage'],
    eventTypeLinks: ['DATA_QUALITY', 'ESTIMATED_PRICE'],
  },
  {
    topicId: 'strategy-basics-momentum-and-dips',
    title: 'Strategy basics: momentum and dips',
    summary:
      'PocketPilot uses simple strategy language first, so a move can be read as building strength, a dip worth watching, or just movement that needs more context.',
    content:
      'The first baseline strategies in PocketPilot are designed to make interpretation legible. Momentum Basics highlights strengthening movement, Dip Buying watches pullbacks without forcing action, and quieter movement can remain in observation until the setup becomes clearer. The aim is orientation, not pressure.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: ['momentum_basics', 'dip_buying', 'snapshot_change'],
    signalLinks: ['signal-breakout', 'signal-dip-window', 'signal-snapshot-change'],
    eventTypeLinks: ['MOMENTUM_BUILDING', 'DIP_DETECTED', 'PRICE_MOVEMENT'],
  },
  {
    topicId: 'reading-market-events',
    title: 'Reading PocketPilot market events',
    summary:
      'A market event describes what changed in the interpreted picture and how settled that read looks right now.',
    content:
      'PocketPilot event labels are meant to answer two quiet questions: what changed, and how much confidence belongs in that change today. Event types such as momentum building, dip detected, estimated price, and data quality are there to frame interpretation. Alignment states such as aligned, watchful, and needs review help show how steady that interpretation feels.',
    mediaType: 'DIAGRAM',
    difficulty: 'INTERMEDIATE',
    strategyLinks: ['momentum_basics', 'dip_buying', 'data_quality', 'snapshot_change'],
    signalLinks: ['signal-breakout', 'signal-dip-window', 'signal-estimated-price'],
    eventTypeLinks: [
      'DATA_QUALITY',
      'ESTIMATED_PRICE',
      'MOMENTUM_BUILDING',
      'DIP_DETECTED',
      'PRICE_MOVEMENT',
    ],
  },
  {
    topicId: 'discipline-before-action',
    title: 'Discipline before action',
    summary:
      'PocketPilot keeps review, constraints, and confirmation ahead of speed so the product stays strategy-first.',
    content:
      'Even when a setup looks clear, PocketPilot treats action as something to examine before it becomes intent. Trade Hub prepares possible paths, but the app still remains read-only in this phase and does not dispatch orders. That slower posture is deliberate: knowledge should support confidence, not rush it.',
    mediaType: 'CASE_STUDY',
    difficulty: 'INTERMEDIATE',
    strategyLinks: ['momentum_basics', 'dip_buying', 'trend_following'],
    signalLinks: ['signal-breakout', 'signal-dip-window', 'signal-trend-extension'],
    eventTypeLinks: ['MOMENTUM_BUILDING', 'DIP_DETECTED', 'PRICE_MOVEMENT'],
  },
] satisfies ReadonlyArray<KnowledgeNode>;
