const RUNTIME_REQUIRED_REGISTER_TOPIC_IDS = Object.freeze([
  // Orientation
  'pp-choosing-profile-and-strategy',
  'pp-what-dashboard-is-for',
  'pp-what-pocketpilot-is',
  'pp-what-snapshot-is-for',
  'pp-what-trade-hub-is-for',
  // Strategies
  'strategy-breakout-watcher',
  'strategy-buy-the-dip',
  'strategy-candle-signals',
  'strategy-confluence-alignment',
  'strategy-fibonacci-zones',
  'strategy-momentum-pulse',
  'strategy-range-trader',
  'strategy-reversion-bounce',
  'strategy-trend-follow',
  // P7-K19 first-wave hidden follow-through evidence routes
  'evidence-trend-follow-bitcoin-above-the-old-high-worked',
  'evidence-trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution',
  'evidence-breakout-watcher-bitcoin-above-the-old-high-worked',
  'evidence-breakout-watcher-bitcoin-august-2020-failed-escape-caution',
  'evidence-buy-the-dip-bitcoin-above-the-old-high-worked',
  'evidence-buy-the-dip-bitcoin-june-to-august-2022-caution',
  // P7-K21 first-wave hidden concept follow-through routes
  'concept-trend',
  'concept-breakout',
  'concept-support',
  'concept-resistance',
  'concept-reversion',
  // Insights and knowledge-system runtime routes
  'pp-what-event-ledger-is-for',
  'pp-what-insights-is-for',
  'pp-what-log-and-journal-are-for',
  'pp-what-monthly-and-quarterly-summaries-are-for',
  'pp-what-reorientation-is-for',
  'pp-what-since-last-checked-is-for',
  'pp-what-summary-archive-is-for',
  'pp-what-year-in-review-is-for',
  'pp-what-knowledge-links-are-for',
  'pp-what-the-knowledge-library-is-for',
  // P7-K12 first-rollout glossary/trade-hub help IDs
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
]);

const RUNTIME_ALLOWED_UNREGISTERED_TOPIC_IDS = Object.freeze([
  // Legacy runtime topics that remain in knowledgeCatalog.ts but are not yet registered in CONTENT_REGISTER.csv.
  'pp-why-pocketpilot-supports-action-without-pushing-action',
  'pp-estimated-vs-confirmed-context',
  'pp-forming-developing-confirming-resolved',
  'pp-what-30000-ft-view-is-for',
  'pp-what-a-marketevent-is',
  'pp-what-alerts-are-for',
  'pp-what-market-regime-means',
  'pp-what-strategy-alignment-means',
  'pp-what-strategy-fit-means',
  'pp-what-strategy-status-means',
  'pp-why-pocketpilot-avoids-urgency-language',
  'pp-what-strategy-preview-strategy-navigator-is-for',
  'pp-position-sizing-basics',
  'pp-risk-reward-basics',
  'pp-stop-loss-basics',
  'pp-take-profit-basics',
  'pp-what-protection-plans-are-for',
]);

module.exports = {
  RUNTIME_REQUIRED_REGISTER_TOPIC_IDS,
  RUNTIME_ALLOWED_UNREGISTERED_TOPIC_IDS,
};
