import type { KnowledgeCatalogEntry } from '@/services/knowledge/types';

export const knowledgeCatalog = [
  {
    topicId: 'pp-choosing-profile-and-strategy',
    title: 'Choosing Your Experience Level and Strategy',
    summary:
      'PocketPilot asks you to choose two things early: your experience level and your strategy. These are different choices. Your experience level changes how the app explains things. Your strategy changes what the app treats as meaningful.',
    content:
      "Overview\n\nPocketPilot asks you to choose two things early: your experience level and your strategy. These are different choices. Your experience level changes how the app explains things. Your strategy changes what the app treats as meaningful.\n\nDeeper context\n\nPocketPilot separates profile, strategy, and voice because they each do a different job.\n\nProfile shapes the relationship:\n\nhow much explanation you see\n\nhow dense the interface feels\n\nhow visible help and knowledge links are\n\nhow much scaffolding you get\n\nStrategy shapes the interpretation:\n\nwhich signals matter most\n\nhow the dashboard emphasizes conditions\n\nwhich alerts are relevant\n\nwhich knowledge links are most useful\n\nThat means two people can choose the same strategy and still have the same underlying logic, while getting different levels of explanation and interface density around it.\n\nPocketPilot's launch set is organized into three strategy families:\n\nValue Hunter\n\nTrend Rider\n\nPattern Navigator\n\nChoosing a strategy is not a permanent identity test. It is choosing a perspective. Inside PocketPilot, changing strategy should feel like adjusting instruments in the same cockpit, not moving to a different product. You can revisit your profile and strategy later.\n\nWhat matters most\n\nchoose the profile that feels most natural right now\n\nchoose the strategy lens that best matches how you want to read the market\n\ndo not worry about getting trapped; the product is designed to let you adjust later\n\nKey terms\n\nprofile\n\nstrategy\n\nvoice\n\nstrategy-first",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'orientation',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'PocketPilot asks you to choose two things early: your experience level and your strategy. These are different choices. Your experience level changes how the app explains things. Your strategy changes what the app treats as meaningful.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'PocketPilot separates profile, strategy, and voice because they each do a different job.',
          'Profile shapes the relationship:',
          'how much explanation you see',
          'how dense the interface feels',
          'how visible help and knowledge links are',
          'how much scaffolding you get',
          'Strategy shapes the interpretation:',
          'which signals matter most',
          'how the dashboard emphasizes conditions',
          'which alerts are relevant',
          'which knowledge links are most useful',
          'That means two people can choose the same strategy and still have the same underlying logic, while getting different levels of explanation and interface density around it.',
          "PocketPilot's launch set is organized into three strategy families:",
          'Value Hunter',
          'Trend Rider',
          'Pattern Navigator',
          'Choosing a strategy is not a permanent identity test. It is choosing a perspective. Inside PocketPilot, changing strategy should feel like adjusting instruments in the same cockpit, not moving to a different product. You can revisit your profile and strategy later.',
        ],
      },
      {
        heading: 'What matters most',
        body: [
          'choose the profile that feels most natural right now',
          'choose the strategy lens that best matches how you want to read the market',
          'do not worry about getting trapped; the product is designed to let you adjust later',
        ],
      },
      {
        heading: 'Key terms',
        body: ['profile', 'strategy', 'voice', 'strategy-first'],
      },
    ],
    relatedTopicIds: [
      'pp-what-pocketpilot-is',
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-preview-strategy-navigator-is-for',
    ],
  },
  {
    topicId: 'pp-what-dashboard-is-for',
    title: 'What Dashboard Is For',
    summary:
      "Dashboard is PocketPilot's focus workspace. It goes deeper than Snapshot while staying structured, strategy-aware, and calm.",
    content:
      "Overview\n\nDashboard is PocketPilot's focus workspace. It goes deeper than Snapshot while staying structured, strategy-aware, and calm.\n\nDeeper context\n\nIf Snapshot answers, What is happening right now? Dashboard answers, How does this affect my strategy in more detail?\n\nDashboard is the focus layer in PocketPilot's Scan → Focus → Deep model. It gives the user more context without turning the product into a random wall of indicators.\n\nIt also reshapes around the chosen strategy while keeping the wider product structure stable. Strategy changes emphasis, not identity. The cockpit stays recognizable. The things that matter most simply move to the front.\n\nThe intended structure is hierarchical:\n\nPrime Zone for the most important interpreted conditions\n\nSecondary Zone for supporting detail\n\nDeep Detail Layer for richer or more advanced information\n\nThat hierarchy matters because Dashboard is where PocketPilot can explain signal relevance, market context, and strategy behavior without drowning the user in raw noise.\n\nWhat it is not\n\nnot free-form user-built chaos\n\nnot a random wall of indicators\n\nnot a louder version of Snapshot\n\nWhy it matters\n\nDashboard is where the product becomes genuinely useful after the first glance. It is the place for focus, not clutter.\n\nKey terms\n\nDashboard\n\nfocus layer\n\nPrime Zone\n\nSecondary Zone",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'orientation',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Dashboard is PocketPilot's focus workspace. It goes deeper than Snapshot while staying structured, strategy-aware, and calm.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'If Snapshot answers, What is happening right now? Dashboard answers, How does this affect my strategy in more detail?',
          "Dashboard is the focus layer in PocketPilot's Scan → Focus → Deep model. It gives the user more context without turning the product into a random wall of indicators.",
          'It also reshapes around the chosen strategy while keeping the wider product structure stable. Strategy changes emphasis, not identity. The cockpit stays recognizable. The things that matter most simply move to the front.',
          'The intended structure is hierarchical:',
          'Prime Zone for the most important interpreted conditions',
          'Secondary Zone for supporting detail',
          'Deep Detail Layer for richer or more advanced information',
          'That hierarchy matters because Dashboard is where PocketPilot can explain signal relevance, market context, and strategy behavior without drowning the user in raw noise.',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not free-form user-built chaos',
          'not a random wall of indicators',
          'not a louder version of Snapshot',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Dashboard is where the product becomes genuinely useful after the first glance. It is the place for focus, not clutter.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['Dashboard', 'focus layer', 'Prime Zone', 'Secondary Zone'],
      },
    ],
    relatedTopicIds: [
      'pp-what-snapshot-is-for',
      'pp-what-strategy-status-means',
      'pp-what-knowledge-links-are-for',
    ],
  },
  {
    topicId: 'pp-what-pocketpilot-is',
    title: 'What PocketPilot Is',
    summary:
      'PocketPilot is a strategy-first crypto decision-support product. You choose the strategy, and the app helps you understand what current market conditions mean through that lens. It is not a prediction engine, not an auto-trading tool, and not a machine for manufacturing urgency.',
    content:
      'Overview\n\nPocketPilot is a strategy-first crypto decision-support product. You choose the strategy, and the app helps you understand what current market conditions mean through that lens. It is not a prediction engine, not an auto-trading tool, and not a machine for manufacturing urgency.\n\nDeeper context\n\nMost crypto products are built to answer one question: What is the market doing?\n\nPocketPilot is built to answer a better one: What does the market mean for your strategy?\n\nThat difference changes the whole shape of the product. PocketPilot is not trying to drown you in indicators, shout at you about volatility, or pretend certainty it does not have. It takes market inputs and turns them into clearer interpretation: strategy status, meaningful events, re-entry context, and action support when you choose to use it.\n\nThe experience follows a simple hierarchy:\n\nScan through Snapshot\n\nFocus through Dashboard\n\nDeep through Insights and Knowledge\n\nPocketPilot is also deliberately calm. It should not hype, dramatize, or pressure. It is execution-aware, but user-directed. Its job is to help you trade your strategy instead of your emotions.\n\nA useful way to think about it is this: PocketPilot is trying to feel less like a noisy trading feed and more like a trusted instrument panel.\n\nWhat it is not\n\nnot a prediction engine\n\nnot auto-trading\n\nnot a raw indicator wall\n\nnot a hype machine\n\nKey terms\n\nstrategy-first\n\ninterpretation layer\n\nScan / Focus / Deep\n\ncalm over urgency',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'orientation',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'PocketPilot is a strategy-first crypto decision-support product. You choose the strategy, and the app helps you understand what current market conditions mean through that lens. It is not a prediction engine, not an auto-trading tool, and not a machine for manufacturing urgency.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Most crypto products are built to answer one question: What is the market doing?',
          'PocketPilot is built to answer a better one: What does the market mean for your strategy?',
          'That difference changes the whole shape of the product. PocketPilot is not trying to drown you in indicators, shout at you about volatility, or pretend certainty it does not have. It takes market inputs and turns them into clearer interpretation: strategy status, meaningful events, re-entry context, and action support when you choose to use it.',
          'The experience follows a simple hierarchy:',
          'Scan through Snapshot',
          'Focus through Dashboard',
          'Deep through Insights and Knowledge',
          'PocketPilot is also deliberately calm. It should not hype, dramatize, or pressure. It is execution-aware, but user-directed. Its job is to help you trade your strategy instead of your emotions.',
          'A useful way to think about it is this: PocketPilot is trying to feel less like a noisy trading feed and more like a trusted instrument panel.',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not a prediction engine',
          'not auto-trading',
          'not a raw indicator wall',
          'not a hype machine',
        ],
      },
      {
        heading: 'Key terms',
        body: [
          'strategy-first',
          'interpretation layer',
          'Scan / Focus / Deep',
          'calm over urgency',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-choosing-profile-and-strategy',
      'pp-what-snapshot-is-for',
      'pp-what-dashboard-is-for',
      'pp-what-the-knowledge-library-is-for',
    ],
  },
  {
    topicId: 'pp-what-snapshot-is-for',
    title: 'What Snapshot Is For',
    summary:
      "Snapshot is PocketPilot's zero-scroll re-entry screen. It is designed to tell you where things stand for your strategy in a few seconds, without turning the first screen into a cluttered dashboard.",
    content:
      "Overview\n\nSnapshot is PocketPilot's zero-scroll re-entry screen. It is designed to tell you where things stand for your strategy in a few seconds, without turning the first screen into a cluttered dashboard.\n\nDeeper context\n\nSnapshot is the scan layer of PocketPilot. It is a calm briefing surface built around three core elements:\n\nCurrent State\n\nLast 24h Change\n\nStrategy Status\n\nIts job is simple: What is going on right now for my strategy?\n\nSnapshot matters because most users do not want a wall of indicators the moment they open the app. They want orientation first. If something looks relevant, they can go deeper into Dashboard. If not, they should be able to close the app feeling informed rather than dragged into noise.\n\nSnapshot is intentionally strict in the product rules. It should not become a study hall, a warning siren, or a crowded market screen with a nicer paint job. Secondary chips are allowed only if they remain clearly subordinate to the core three-part briefing.\n\nWhat it is not\n\nnot a giant indicator wall\n\nnot a full analysis workspace\n\nnot an urgency surface\n\nWhy it matters\n\nSnapshot gives users fast orientation. It answers the first question cleanly so they can decide whether to go deeper or simply move on with confidence.\n\nKey terms\n\nSnapshot\n\nzero-scroll\n\nscan layer\n\nStrategy Status",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'orientation',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Snapshot is PocketPilot's zero-scroll re-entry screen. It is designed to tell you where things stand for your strategy in a few seconds, without turning the first screen into a cluttered dashboard.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Snapshot is the scan layer of PocketPilot. It is a calm briefing surface built around three core elements:',
          'Current State',
          'Last 24h Change',
          'Strategy Status',
          'Its job is simple: What is going on right now for my strategy?',
          'Snapshot matters because most users do not want a wall of indicators the moment they open the app. They want orientation first. If something looks relevant, they can go deeper into Dashboard. If not, they should be able to close the app feeling informed rather than dragged into noise.',
          'Snapshot is intentionally strict in the product rules. It should not become a study hall, a warning siren, or a crowded market screen with a nicer paint job. Secondary chips are allowed only if they remain clearly subordinate to the core three-part briefing.',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not a giant indicator wall',
          'not a full analysis workspace',
          'not an urgency surface',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Snapshot gives users fast orientation. It answers the first question cleanly so they can decide whether to go deeper or simply move on with confidence.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['Snapshot', 'zero-scroll', 'scan layer', 'Strategy Status'],
      },
    ],
    relatedTopicIds: [
      'pp-what-dashboard-is-for',
      'pp-what-since-last-checked-is-for',
      'pp-what-strategy-status-means',
    ],
  },
  {
    topicId: 'pp-what-trade-hub-is-for',
    title: 'What Trade Hub Is For',
    summary:
      "Trade Hub is PocketPilot's action-support layer. It helps structure action when you choose to act, without turning the product into a casino panel.",
    content:
      "Overview\n\nTrade Hub is PocketPilot's action-support layer. It helps structure action when you choose to act, without turning the product into a casino panel.\n\nDeeper context\n\nTrade Hub sits downstream from interpretation. If Snapshot is scan and Dashboard is focus, Trade Hub is the action-support layer.\n\nIts purpose is not to pressure action. Its purpose is to reduce friction when the user has already chosen to act, while preserving explicit control, confirmation, and a support-first posture.\n\nThat means Trade Hub should help the user move from understanding toward preparation more cleanly. It should support action without becoming pushy, theatrical, or automation-happy.\n\nWhat it can include\n\nexecution support\n\nrisk tools\n\nSL/TP calculator\n\nProtectionPlan framing\n\nconfirmation-safe previews\n\nWhat it is not\n\nnot auto-trading\n\nnot hidden automation\n\nnot one-tap gambling\n\nnot a pressure surface\n\nWhy it matters\n\nTrade Hub bridges interpretation and action cleanly. It helps the user move from understanding to preparation without collapsing PocketPilot's calm tone or handing control to the system.\n\nKey terms\n\nTrade Hub\n\naction layer\n\nconfirmation\n\nsupport not enforcement",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'orientation',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Trade Hub is PocketPilot's action-support layer. It helps structure action when you choose to act, without turning the product into a casino panel.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Trade Hub sits downstream from interpretation. If Snapshot is scan and Dashboard is focus, Trade Hub is the action-support layer.',
          'Its purpose is not to pressure action. Its purpose is to reduce friction when the user has already chosen to act, while preserving explicit control, confirmation, and a support-first posture.',
          'That means Trade Hub should help the user move from understanding toward preparation more cleanly. It should support action without becoming pushy, theatrical, or automation-happy.',
        ],
      },
      {
        heading: 'What it can include',
        body: [
          'execution support',
          'risk tools',
          'SL/TP calculator',
          'ProtectionPlan framing',
          'confirmation-safe previews',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not auto-trading',
          'not hidden automation',
          'not one-tap gambling',
          'not a pressure surface',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          "Trade Hub bridges interpretation and action cleanly. It helps the user move from understanding to preparation without collapsing PocketPilot's calm tone or handing control to the system.",
        ],
      },
      {
        heading: 'Key terms',
        body: ['Trade Hub', 'action layer', 'confirmation', 'support not enforcement'],
      },
    ],
    relatedTopicIds: [
      'pp-why-pocketpilot-supports-action-without-pushing-action',
      'pp-what-protection-plans-are-for',
      'pp-stop-loss-basics',
    ],
  },
  {
    topicId: 'pp-why-pocketpilot-supports-action-without-pushing-action',
    title: 'Why PocketPilot Supports Action Without Pushing Action',
    summary:
      'PocketPilot helps users prepare for action, but it is deliberately designed not to pressure, rush, or quietly take control away from them.',
    content:
      'Overview\n\nPocketPilot helps users prepare for action, but it is deliberately designed not to pressure, rush, or quietly take control away from them.\n\nDeeper context\n\nMany trading products become louder and more manipulative as the user gets closer to doing something. PocketPilot is built to resist that pattern.\n\nSupporting action means the product can help with:\n\nreadiness\n\nrisk framing\n\nprotection planning\n\nconfirmation-safe review\n\nPushing action would mean:\n\nurgency language\n\ncasino mechanics\n\nhidden automation\n\nreducing hesitation through pressure instead of clarity\n\nWhy this matters\n\nThe product is execution-aware, but user-directed. The user remains the pilot. Risk tools are support, not control.\n\nKey terms\n\nsupport not enforcement\n\nuser remains the pilot\n\nconfirmation-safe',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'orientation',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'PocketPilot helps users prepare for action, but it is deliberately designed not to pressure, rush, or quietly take control away from them.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Many trading products become louder and more manipulative as the user gets closer to doing something. PocketPilot is built to resist that pattern.',
          'Supporting action means the product can help with:',
          'readiness',
          'risk framing',
          'protection planning',
          'confirmation-safe review',
          'Pushing action would mean:',
          'urgency language',
          'casino mechanics',
          'hidden automation',
          'reducing hesitation through pressure instead of clarity',
        ],
      },
      {
        heading: 'Why this matters',
        body: [
          'The product is execution-aware, but user-directed. The user remains the pilot. Risk tools are support, not control.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['support not enforcement', 'user remains the pilot', 'confirmation-safe'],
      },
    ],
    relatedTopicIds: [
      'pp-what-trade-hub-is-for',
      'pp-what-protection-plans-are-for',
      'pp-why-pocketpilot-avoids-urgency-language',
    ],
  },
  {
    topicId: 'pp-estimated-vs-confirmed-context',
    title: 'Estimated vs Confirmed Context',
    summary:
      'PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is. Estimated does not mean broken. Confirmed does not mean guaranteed.',
    content:
      'Overview\n\nPocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is. Estimated does not mean broken. Confirmed does not mean guaranteed.\n\nDeeper context\n\nMarkets are rarely clean enough for total certainty. PocketPilot is designed to communicate that honestly.\n\nEstimated context means the product has a useful read, but it is still provisional, incomplete, or not strong enough to present as settled.\n\nConfirmed context means the read looks more established or better supported by the evidence currently available.\n\nThe important rule is that the app must never upgrade weak context into stronger-sounding certainty. This is a trust issue as much as a wording issue.\n\nWhy the distinction matters\n\nit prevents false confidence\n\nit stops weak reads from sounding like advice\n\nit helps users judge how firm the current interpretation is\n\nCommon misunderstandings\n\nestimated does not mean useless\n\nconfirmed does not mean the future is locked\n\nKey terms\n\nestimated\n\nconfirmed\n\nprovisional\n\nconfidence must be honest',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is. Estimated does not mean broken. Confirmed does not mean guaranteed.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Markets are rarely clean enough for total certainty. PocketPilot is designed to communicate that honestly.',
          'Estimated context means the product has a useful read, but it is still provisional, incomplete, or not strong enough to present as settled.',
          'Confirmed context means the read looks more established or better supported by the evidence currently available.',
          'The important rule is that the app must never upgrade weak context into stronger-sounding certainty. This is a trust issue as much as a wording issue.',
        ],
      },
      {
        heading: 'Why the distinction matters',
        body: [
          'it prevents false confidence',
          'it stops weak reads from sounding like advice',
          'it helps users judge how firm the current interpretation is',
        ],
      },
      {
        heading: 'Common misunderstandings',
        body: ['estimated does not mean useless', 'confirmed does not mean the future is locked'],
      },
      {
        heading: 'Key terms',
        body: ['estimated', 'confirmed', 'provisional', 'confidence must be honest'],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-status-means',
      'pp-what-a-marketevent-is',
      'pp-why-pocketpilot-avoids-urgency-language',
    ],
  },
  {
    topicId: 'pp-forming-developing-confirming-resolved',
    title: 'Forming, Developing, Confirming, and Resolved',
    summary:
      'PocketPilot uses state language like forming, developing, confirming, and resolved to describe where a condition or interpreted event appears to be in its lifecycle. These are progress words, not prophecy words.',
    content:
      'Overview\n\nPocketPilot uses state language like forming, developing, confirming, and resolved to describe where a condition or interpreted event appears to be in its lifecycle. These are progress words, not prophecy words.\n\nDeeper context\n\nMarkets rarely move from "nothing" to "certain" in one step. Conditions emerge, strengthen, weaken, invalidate, and resolve over time. PocketPilot uses lifecycle language so it can describe that process more honestly.\n\nForming: early pieces may be starting to appear\n\nDeveloping: the picture is becoming clearer\n\nConfirming: the read looks more established\n\nResolved: the phase has played out or stopped being active in the same way\n\nPocketPilot also preserves invalidation, because not every developing condition goes on to confirm.\n\nWhy this matters\n\nLifecycle language helps the user understand how something is changing without forcing the product into fake certainty.\n\nWhat confirming is not\n\nConfirming does not mean guaranteed. It means more established.\n\nKey terms\n\nforming\n\ndeveloping\n\nconfirming\n\ninvalidation\n\nresolved',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'PocketPilot uses state language like forming, developing, confirming, and resolved to describe where a condition or interpreted event appears to be in its lifecycle. These are progress words, not prophecy words.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Markets rarely move from "nothing" to "certain" in one step. Conditions emerge, strengthen, weaken, invalidate, and resolve over time. PocketPilot uses lifecycle language so it can describe that process more honestly.',
          'Forming: early pieces may be starting to appear',
          'Developing: the picture is becoming clearer',
          'Confirming: the read looks more established',
          'Resolved: the phase has played out or stopped being active in the same way',
          'PocketPilot also preserves invalidation, because not every developing condition goes on to confirm.',
        ],
      },
      {
        heading: 'Why this matters',
        body: [
          'Lifecycle language helps the user understand how something is changing without forcing the product into fake certainty.',
        ],
      },
      {
        heading: 'What confirming is not',
        body: ['Confirming does not mean guaranteed. It means more established.'],
      },
      {
        heading: 'Key terms',
        body: ['forming', 'developing', 'confirming', 'invalidation', 'resolved'],
      },
    ],
    relatedTopicIds: [
      'pp-what-a-marketevent-is',
      'pp-estimated-vs-confirmed-context',
      'pp-what-strategy-status-means',
    ],
  },
  {
    topicId: 'pp-what-30000-ft-view-is-for',
    title: 'What 30,000 ft View Is For',
    summary:
      "30,000 ft View is PocketPilot's stabilizing macro-context layer for elevated volatility or major structural shifts. It gives users altitude during chaos.",
    content:
      "Overview\n\n30,000 ft View is PocketPilot's stabilizing macro-context layer for elevated volatility or major structural shifts. It gives users altitude during chaos.\n\nDeeper context\n\n30,000 ft View exists for moments when zooming out is more helpful than staring harder at immediate noise. It can include things like volatility percentile, broader trend structure, historical grounding, and strategy fit context.\n\nThe crucial rules are:\n\nit should calm, not escalate\n\nit should not recommend action\n\nit should not behave like a siren\n\nWhy it matters\n\nIt helps users regain bearings during abnormal conditions without breaking the product's tone.\n\nKey terms\n\n30,000 ft View\n\nmacro context\n\nvolatility percentile\n\ngrounding",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "30,000 ft View is PocketPilot's stabilizing macro-context layer for elevated volatility or major structural shifts. It gives users altitude during chaos.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          '30,000 ft View exists for moments when zooming out is more helpful than staring harder at immediate noise. It can include things like volatility percentile, broader trend structure, historical grounding, and strategy fit context.',
          'The crucial rules are:',
          'it should calm, not escalate',
          'it should not recommend action',
          'it should not behave like a siren',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          "It helps users regain bearings during abnormal conditions without breaking the product's tone.",
        ],
      },
      {
        heading: 'Key terms',
        body: ['30,000 ft View', 'macro context', 'volatility percentile', 'grounding'],
      },
    ],
    relatedTopicIds: [
      'pp-what-market-regime-means',
      'pp-what-snapshot-is-for',
      'pp-why-pocketpilot-avoids-urgency-language',
    ],
  },
  {
    topicId: 'pp-what-a-marketevent-is',
    title: 'What a MarketEvent Is',
    summary:
      'A MarketEvent is PocketPilot\'s unit of meaningful interpreted change. It is not just a raw signal moving. It is the product\'s way of saying, "Something changed in a way that matters for your strategy."',
    content:
      "Overview\n\nA MarketEvent is PocketPilot's unit of meaningful interpreted change. It is not just a raw signal moving. It is the product's way of saying, \"Something changed in a way that matters for your strategy.\"\n\nDeeper context\n\nPocketPilot's pipeline turns quotes into indicators, indicators into signals, and signals into strategy interpretation. A MarketEvent is the user-facing result of that interpretation.\n\nInstead of showing disconnected technical fragments, PocketPilot can surface a more readable event such as:\n\nalignment strengthening\n\nvolatility expansion\n\npattern forming\n\nregime shift\n\nthreshold or structural change\n\nThis is important because the product is not built around raw signal spam. It is built around meaningful change. MarketEvents power Snapshot updates, Since Last Checked, alerts, Event Ledger, reflection, journaling, and summaries.\n\nSignal vs event\n\na signal is an input or clue\n\na MarketEvent is the interpreted situation those clues create\n\nWhat a MarketEvent is not\n\nevery tiny market movement\n\na trade command\n\na guarantee\n\nan excuse for urgency language\n\nKey terms\n\nMarketEvent\n\nmeaningful change\n\ninterpreted event\n\nevent pipeline",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'A MarketEvent is PocketPilot\'s unit of meaningful interpreted change. It is not just a raw signal moving. It is the product\'s way of saying, "Something changed in a way that matters for your strategy."',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          "PocketPilot's pipeline turns quotes into indicators, indicators into signals, and signals into strategy interpretation. A MarketEvent is the user-facing result of that interpretation.",
          'Instead of showing disconnected technical fragments, PocketPilot can surface a more readable event such as:',
          'alignment strengthening',
          'volatility expansion',
          'pattern forming',
          'regime shift',
          'threshold or structural change',
          'This is important because the product is not built around raw signal spam. It is built around meaningful change. MarketEvents power Snapshot updates, Since Last Checked, alerts, Event Ledger, reflection, journaling, and summaries.',
        ],
      },
      {
        heading: 'Signal vs event',
        body: [
          'a signal is an input or clue',
          'a MarketEvent is the interpreted situation those clues create',
        ],
      },
      {
        heading: 'What a MarketEvent is not',
        body: [
          'every tiny market movement',
          'a trade command',
          'a guarantee',
          'an excuse for urgency language',
        ],
      },
      {
        heading: 'Key terms',
        body: ['MarketEvent', 'meaningful change', 'interpreted event', 'event pipeline'],
      },
    ],
    relatedTopicIds: [
      'pp-estimated-vs-confirmed-context',
      'pp-forming-developing-confirming-resolved',
      'pp-what-event-ledger-is-for',
    ],
  },
  {
    topicId: 'pp-what-alerts-are-for',
    title: 'What Alerts Are For',
    summary:
      "Alerts are PocketPilot's way of drawing attention to meaningful strategy-relevant change, not every tiny twitch in the market.",
    content:
      "Overview\n\nAlerts are PocketPilot's way of drawing attention to meaningful strategy-relevant change, not every tiny twitch in the market.\n\nDeeper context\n\nAlerts should be tied to interpreted meaning, not raw motion. They exist so users can notice meaningful change without staring at the app constantly.\n\nA good PocketPilot alert should be:\n\nselective\n\ncalm\n\nstrategy-aware\n\nconfidence-honest\n\nWhat alerts are not\n\nnot an urgency feed\n\nnot a casino mechanic\n\nnot a substitute for thinking\n\nKey terms\n\nalert\n\nmeaningful change\n\nselective awareness",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Alerts are PocketPilot's way of drawing attention to meaningful strategy-relevant change, not every tiny twitch in the market.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Alerts should be tied to interpreted meaning, not raw motion. They exist so users can notice meaningful change without staring at the app constantly.',
          'A good PocketPilot alert should be:',
          'selective',
          'calm',
          'strategy-aware',
          'confidence-honest',
        ],
      },
      {
        heading: 'What alerts are not',
        body: ['not an urgency feed', 'not a casino mechanic', 'not a substitute for thinking'],
      },
      {
        heading: 'Key terms',
        body: ['alert', 'meaningful change', 'selective awareness'],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-status-means',
      'pp-what-since-last-checked-is-for',
      'pp-why-pocketpilot-avoids-urgency-language',
    ],
  },
  {
    topicId: 'pp-what-market-regime-means',
    title: 'What Market Regime Means',
    summary:
      "Market Regime is PocketPilot's descriptive layer for the broader market environment. It adds context, but it is not a global override or a command system.",
    content:
      "Overview\n\nMarket Regime is PocketPilot's descriptive layer for the broader market environment. It adds context, but it is not a global override or a command system.\n\nDeeper context\n\nRegime helps describe what kind of market environment the user is dealing with, such as trend, sideways structure, volatility expansion, or compression.\n\nThe key rule is that regime is contextual, not controlling. It informs strategy logic through interpretation, but it does not replace the strategy layer.\n\nWhy it matters\n\nDifferent strategies naturally behave differently in different environments. Regime helps explain that broader weather without becoming the boss of the whole product.\n\nKey terms\n\nmarket regime\n\ntrend regime\n\nvolatility expansion\n\ncontextual not controlling",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Market Regime is PocketPilot's descriptive layer for the broader market environment. It adds context, but it is not a global override or a command system.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Regime helps describe what kind of market environment the user is dealing with, such as trend, sideways structure, volatility expansion, or compression.',
          'The key rule is that regime is contextual, not controlling. It informs strategy logic through interpretation, but it does not replace the strategy layer.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Different strategies naturally behave differently in different environments. Regime helps explain that broader weather without becoming the boss of the whole product.',
        ],
      },
      {
        heading: 'Key terms',
        body: [
          'market regime',
          'trend regime',
          'volatility expansion',
          'contextual not controlling',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-fit-means',
      'pp-what-30000-ft-view-is-for',
      'pp-what-strategy-alignment-means',
    ],
  },
  {
    topicId: 'pp-what-strategy-alignment-means',
    title: 'What Strategy Alignment Means',
    summary:
      "Strategy Alignment is PocketPilot's read on how well current market conditions match the logic of your chosen strategy. It is descriptive, not directive. It helps you understand whether the market is becoming more relevant, less relevant, or mixed for the lens you selected.",
    content:
      'Overview\n\nStrategy Alignment is PocketPilot\'s read on how well current market conditions match the logic of your chosen strategy. It is descriptive, not directive. It helps you understand whether the market is becoming more relevant, less relevant, or mixed for the lens you selected.\n\nDeeper context\n\nAlignment sits at the heart of PocketPilot. The product is strategy-first, so it should not just report that a signal exists. It should ask whether the current environment is lining up with the strategy the user chose.\n\nA good plain-English framing is: Alignment answers, "How well do current conditions match what this strategy cares about?"\n\nAlignment can strengthen, weaken, remain mixed, or sit in a more neutral state. That does not mean the app is telling you to trade. It means the interpretation layer is describing how current conditions relate to the chosen framework.\n\nAlignment matters because the same market can look completely different through different strategies. A move that looks attractive to a momentum strategy may look noisy to a range strategy. Alignment is the product\'s way of keeping that distinction visible.\n\nWhat alignment is not\n\nnot a guarantee\n\nnot a command\n\nnot a switch recommendation engine\n\nnot a replacement for judgment\n\nWhy it matters\n\nAlignment is one of the main bridges between raw market inputs and the user-facing product. It shapes strategy status, alerts, MarketEvents, dashboard emphasis, and explanation language.\n\nKey terms\n\nalignment\n\nstrengthening\n\nweakening\n\nmixed\n\nstrategy lens',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Strategy Alignment is PocketPilot's read on how well current market conditions match the logic of your chosen strategy. It is descriptive, not directive. It helps you understand whether the market is becoming more relevant, less relevant, or mixed for the lens you selected.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Alignment sits at the heart of PocketPilot. The product is strategy-first, so it should not just report that a signal exists. It should ask whether the current environment is lining up with the strategy the user chose.',
          'A good plain-English framing is: Alignment answers, "How well do current conditions match what this strategy cares about?"',
          'Alignment can strengthen, weaken, remain mixed, or sit in a more neutral state. That does not mean the app is telling you to trade. It means the interpretation layer is describing how current conditions relate to the chosen framework.',
          "Alignment matters because the same market can look completely different through different strategies. A move that looks attractive to a momentum strategy may look noisy to a range strategy. Alignment is the product's way of keeping that distinction visible.",
        ],
      },
      {
        heading: 'What alignment is not',
        body: [
          'not a guarantee',
          'not a command',
          'not a switch recommendation engine',
          'not a replacement for judgment',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Alignment is one of the main bridges between raw market inputs and the user-facing product. It shapes strategy status, alerts, MarketEvents, dashboard emphasis, and explanation language.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['alignment', 'strengthening', 'weakening', 'mixed', 'strategy lens'],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-status-means',
      'pp-what-strategy-fit-means',
      'pp-what-a-marketevent-is',
    ],
  },
  {
    topicId: 'pp-what-strategy-fit-means',
    title: 'What Strategy Fit Means',
    summary:
      'Strategy Fit describes how well the broader market environment tends to suit your chosen strategy. It is context, not instruction.',
    content:
      "Overview\n\nStrategy Fit describes how well the broader market environment tends to suit your chosen strategy. It is context, not instruction.\n\nDeeper context\n\nFit is PocketPilot's broader suitability layer. Where alignment is the more immediate read on current conditions, fit is a larger environmental read.\n\nA useful distinction:\n\nfit = how the broader environment tends to suit the strategy\n\nalignment = how current conditions relate to the strategy right now\n\nFit can be favorable, mixed, or unfavorable. None of those states is a command. Favorable fit is not a green light. Unfavorable fit is not a judgment that you chose the wrong strategy forever.\n\nWhy it matters\n\nFit helps users understand why a strategy may feel easier or harder to read in a given period. It creates nuance without turning the product into a recommendation engine.\n\nWhat fit is not\n\nnot a command to switch strategies\n\nnot a trade instruction\n\nnot a guarantee\n\nKey terms\n\nfit\n\nfavorable\n\nmixed\n\nunfavorable",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Strategy Fit describes how well the broader market environment tends to suit your chosen strategy. It is context, not instruction.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          "Fit is PocketPilot's broader suitability layer. Where alignment is the more immediate read on current conditions, fit is a larger environmental read.",
          'A useful distinction:',
          'fit = how the broader environment tends to suit the strategy',
          'alignment = how current conditions relate to the strategy right now',
          'Fit can be favorable, mixed, or unfavorable. None of those states is a command. Favorable fit is not a green light. Unfavorable fit is not a judgment that you chose the wrong strategy forever.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Fit helps users understand why a strategy may feel easier or harder to read in a given period. It creates nuance without turning the product into a recommendation engine.',
        ],
      },
      {
        heading: 'What fit is not',
        body: ['not a command to switch strategies', 'not a trade instruction', 'not a guarantee'],
      },
      {
        heading: 'Key terms',
        body: ['fit', 'favorable', 'mixed', 'unfavorable'],
      },
    ],
    relatedTopicIds: [
      'pp-what-market-regime-means',
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-status-means',
    ],
  },
  {
    topicId: 'pp-what-strategy-status-means',
    title: 'What Strategy Status Means',
    summary:
      "Strategy Status is PocketPilot's quick, visible read on how current conditions relate to your chosen strategy. It is built for orientation, not instruction.",
    content:
      "Overview\n\nStrategy Status is PocketPilot's quick, visible read on how current conditions relate to your chosen strategy. It is built for orientation, not instruction.\n\nDeeper context\n\nStrategy Status is part of Snapshot's core triad. It gives the user a fast answer to: What's going on right now for my strategy?\n\nTypical status words include:\n\naligned\n\nforming\n\nneutral\n\nweak\n\nThese are interpretation labels, not guarantees or commands. A stronger-looking status is not a green light. A weaker one is not a verdict on the user.\n\nWhy it stays short\n\nSnapshot is meant to be glanceable and zero-scroll. Strategy Status exists to compress interpretation into something legible in seconds.\n\nKey terms\n\nStrategy Status\n\naligned\n\nforming\n\nneutral\n\nweak",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Strategy Status is PocketPilot's quick, visible read on how current conditions relate to your chosen strategy. It is built for orientation, not instruction.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          "Strategy Status is part of Snapshot's core triad. It gives the user a fast answer to: What's going on right now for my strategy?",
          'Typical status words include:',
          'aligned',
          'forming',
          'neutral',
          'weak',
          'These are interpretation labels, not guarantees or commands. A stronger-looking status is not a green light. A weaker one is not a verdict on the user.',
        ],
      },
      {
        heading: 'Why it stays short',
        body: [
          'Snapshot is meant to be glanceable and zero-scroll. Strategy Status exists to compress interpretation into something legible in seconds.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['Strategy Status', 'aligned', 'forming', 'neutral', 'weak'],
      },
    ],
    relatedTopicIds: [
      'pp-what-snapshot-is-for',
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
    ],
  },
  {
    topicId: 'pp-why-pocketpilot-avoids-urgency-language',
    title: 'Why PocketPilot Avoids Urgency Language',
    summary:
      'PocketPilot avoids urgency language because urgency often makes people feel faster without making them clearer.',
    content:
      'Overview\n\nPocketPilot avoids urgency language because urgency often makes people feel faster without making them clearer.\n\nDeeper context\n\nThe product\'s tone rules are deliberate. PocketPilot is built around calm over urgency, interpretation over noise, and support without coercion.\n\nThat means it should avoid:\n\nact now language\n\n"don\'t miss this" energy\n\nfake certainty\n\ncasino-style alert behavior\n\nIt should still report meaningful change. It just should not weaponize that change into emotional pressure.\n\nWhy it matters\n\nCrypto markets already generate enough emotional heat. The product should cool that down, not intensify it.\n\nKey terms\n\nurgency language\n\nmeaningful change\n\nfake certainty',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'PocketPilot avoids urgency language because urgency often makes people feel faster without making them clearer.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          "The product's tone rules are deliberate. PocketPilot is built around calm over urgency, interpretation over noise, and support without coercion.",
          'That means it should avoid:',
          'act now language',
          '"don\'t miss this" energy',
          'fake certainty',
          'casino-style alert behavior',
          'It should still report meaningful change. It just should not weaponize that change into emotional pressure.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Crypto markets already generate enough emotional heat. The product should cool that down, not intensify it.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['urgency language', 'meaningful change', 'fake certainty'],
      },
    ],
    relatedTopicIds: [
      'pp-what-alerts-are-for',
      'pp-estimated-vs-confirmed-context',
      'pp-why-pocketpilot-supports-action-without-pushing-action',
    ],
  },
  {
    topicId: 'strategy-breakout-watcher',
    title: 'Breakout Watcher',
    summary: 'Breakout Watcher is a strategy built around the idea that price sometimes spends long periods contained inside a clear structure, then escapes that structure in a way that begins a new directional move. It is less about predicting every breakout in advance and more about recognizing when containment is ending in a meaningful way.',
    content:
      "What this means\n\nTrading when price moves beyond a key level.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: repeated tests and pressure.\n\nWhat you're looking for\n\nLook for repeated tests and pressure.\n\nWhy it can work\n\nWorks because breaks can trigger moves.\n\nWhat can go wrong\n\nFails if breakout fails.\n\nCommon misunderstanding\n\nAssuming all breakouts continue.\n\nWhat this strategy is for\n\nBreakout Watcher is for markets pressing against meaningful boundaries where a breakout may be starting.\n\nWhat it looks for\n\nIt cares about whether price moves through a meaningful area and begins to build acceptance outside the old structure.\n\nWhat improves fit\n\nFit improves when the market is building structure outside the old boundary and increasing confirmed confidence.\n\nWhat weakens fit\n\nFit weakens when the move runs into rejection, returns to the old area, becomes a false breakout, or triggers fast invalidation.\n\nWhat PocketPilot would emphasize\n\nA spike through a level is interesting. A hold matters more.\n\nWhat a user should learn\n\nBreakouts are about whether the market actually starts behaving differently.\n\nWhat to read next\n\nBitcoin’s August 2020 Failed Escape Above $12,000\n\nSupport, Resistance, and Structure\n\nbreakout vs acceptance explainer\n\nHow it behaves\n\nBreakout Watcher responds to price approaching and moving beyond key levels. These moments often follow periods of compression or repeated testing.\n\nWhat strengthens it\n\nrepeated interaction with a level\n\ntightening price movement before expansion\n\nincreased activity around the level\n\nWhat weakens it\n\ninconsistent pressure at the level\n\nwide, unstable movement\n\nlack of follow-through after initial break\n\nHow it tends to fail\n\nBreakouts can reverse quickly. Price may move beyond a level and then return, creating a false breakout.\n\nHow it connects to planning\n\nEntry price reflects where the breakout is being interpreted. Stop-loss price helps define invalidation if price returns to prior range. Target price acts as a review point if expansion continues. Prepared planning levels can outline breakout zones. Risk amount and risk percent help manage volatility around levels. Guardrails highlight when behaviour becomes unstable.\n\nWhat to watch for\n\nassuming every breakout will continue\n\nreacting to the first move without confirmation\n\nignoring failed breakout behaviour",
    mediaType: 'ARTICLE',
    difficulty: 'INTERMEDIATE',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Trading when price moves beyond a key level.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: repeated tests and pressure.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for repeated tests and pressure.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works because breaks can trigger moves.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Fails if breakout fails.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Assuming all breakouts continue.',
        ],
      },
      {
        heading: 'What this strategy is for',
        body: [
          'Breakout Watcher is for markets pressing against meaningful boundaries where a breakout may be starting.',
        ],
      },
      {
        heading: 'What it looks for',
        body: [
          'It cares about whether price moves through a meaningful area and begins to build acceptance outside the old structure.',
        ],
      },
      {
        heading: 'What improves fit',
        body: [
          'Fit improves when the market is building structure outside the old boundary and increasing confirmed confidence.',
        ],
      },
      {
        heading: 'What weakens fit',
        body: [
          'Fit weakens when the move runs into rejection, returns to the old area, becomes a false breakout, or triggers fast invalidation.',
        ],
      },
      {
        heading: 'What PocketPilot would emphasize',
        body: [
          'A spike through a level is interesting. A hold matters more.',
        ],
      },
      {
        heading: 'What a user should learn',
        body: [
          'Breakouts are about whether the market actually starts behaving differently.',
        ],
      },
      {
        heading: 'What to read next',
        body: [
          'Bitcoin’s August 2020 Failed Escape Above $12,000',
          'Support, Resistance, and Structure',
          'breakout vs acceptance explainer',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Breakout Watcher responds to price approaching and moving beyond key levels. These moments often follow periods of compression or repeated testing.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'repeated interaction with a level',
          'tightening price movement before expansion',
          'increased activity around the level',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'inconsistent pressure at the level',
          'wide, unstable movement',
          'lack of follow-through after initial break',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'Breakouts can reverse quickly. Price may move beyond a level and then return, creating a false breakout.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price reflects where the breakout is being interpreted. Stop-loss price helps define invalidation if price returns to prior range. Target price acts as a review point if expansion continues. Prepared planning levels can outline breakout zones. Risk amount and risk percent help manage volatility around levels. Guardrails highlight when behaviour becomes unstable.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'assuming every breakout will continue',
          'reacting to the first move without confirmation',
          'ignoring failed breakout behaviour',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-market-regime-means',
      'pp-what-a-marketevent-is',
      'pp-estimated-vs-confirmed-context',
      'pp-risk-reward-basics',
    ],
  },
  {
    topicId: 'strategy-buy-the-dip',
    title: 'Buy the Dip',
    summary: 'Buy the Dip is a strategy built around looking for temporary pullbacks inside a broader upward market structure. It is less about chasing every red candle and more about judging whether a setback looks like a pause inside strength rather than the start of something weaker.',
    content:
      "What this means\n\nBuying after price drops, expecting it to recover.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: pullbacks in an upward trend and signs the drop is slowing.\n\nWhat you're looking for\n\nLook for pullbacks in an upward trend and signs the drop is slowing.\n\nWhy it can work\n\nWorks because markets move in waves.\n\nWhat can go wrong\n\nCan fail if the drop continues.\n\nCommon misunderstanding\n\nAssuming every dip is worth buying.\n\nWhat this strategy is for\n\nBuy the Dip is for situations where a dip may be creating opportunity without the broader picture being broken beyond repair.\n\nWhat it looks for\n\nIt looks for weakness happening inside an environment where recovery still feels plausible.\n\nWhat improves fit\n\nStrategy fit improves when the broader structure still looks supportive and the market is not obviously degrading into a harsher regime.\n\nWhat weakens fit\n\nFit weakens when the move looks more like a relief rally than repair, or when improvement is visible but still not enough to count as meaningful change.\n\nHow it behaves\n\nBuy the Dip responds to pullbacks within a broader move, where price temporarily moves against the prior direction before attempting to stabilise. These dips can be shallow pauses or deeper drawdowns, often accompanied by increased volatility and uncertainty.\n\nWhat strengthens it\n\npullbacks into previously active support areas\n\nslowing downside movement after a drop\n\nbroader context that has not clearly broken down\n\nWhat weakens it\n\nfast, continuous downward movement\n\nlack of visible structure where price might stabilise\n\nunclear broader context\n\nHow it tends to fail\n\nA dip can turn into a breakdown. Price may continue lower without stabilising, or briefly pause before continuing downward. What looks like a temporary pullback can be a shift in structure.\n\nHow it connects to planning\n\nEntry price helps define where the dip is being interpreted. Stop-loss price helps define the point where the dip idea may no longer be valid. Target price acts as a review point if price recovers. Prepared planning levels can offer initial context but require adjustment. Risk amount and risk percent help keep downside consistent. Guardrails help highlight when risk increases during volatile pullbacks.\n\nWhat to watch for\n\nassuming every drop is a dip\n\nreacting to movement instead of structure\n\nletting emotion replace planning once price starts moving quickly",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Buying after price drops, expecting it to recover.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: pullbacks in an upward trend and signs the drop is slowing.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for pullbacks in an upward trend and signs the drop is slowing.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works because markets move in waves.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Can fail if the drop continues.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Assuming every dip is worth buying.',
        ],
      },
      {
        heading: 'What this strategy is for',
        body: [
          'Buy the Dip is for situations where a dip may be creating opportunity without the broader picture being broken beyond repair.',
        ],
      },
      {
        heading: 'What it looks for',
        body: [
          'It looks for weakness happening inside an environment where recovery still feels plausible.',
        ],
      },
      {
        heading: 'What improves fit',
        body: [
          'Strategy fit improves when the broader structure still looks supportive and the market is not obviously degrading into a harsher regime.',
        ],
      },
      {
        heading: 'What weakens fit',
        body: [
          'Fit weakens when the move looks more like a relief rally than repair, or when improvement is visible but still not enough to count as meaningful change.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Buy the Dip responds to pullbacks within a broader move, where price temporarily moves against the prior direction before attempting to stabilise. These dips can be shallow pauses or deeper drawdowns, often accompanied by increased volatility and uncertainty.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'pullbacks into previously active support areas',
          'slowing downside movement after a drop',
          'broader context that has not clearly broken down',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'fast, continuous downward movement',
          'lack of visible structure where price might stabilise',
          'unclear broader context',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'A dip can turn into a breakdown. Price may continue lower without stabilising, or briefly pause before continuing downward. What looks like a temporary pullback can be a shift in structure.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price helps define where the dip is being interpreted. Stop-loss price helps define the point where the dip idea may no longer be valid. Target price acts as a review point if price recovers. Prepared planning levels can offer initial context but require adjustment. Risk amount and risk percent help keep downside consistent. Guardrails help highlight when risk increases during volatile pullbacks.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'assuming every drop is a dip',
          'reacting to movement instead of structure',
          'letting emotion replace planning once price starts moving quickly',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-strategy-status-means',
      'pp-estimated-vs-confirmed-context',
      'pp-stop-loss-basics',
      'pp-risk-reward-basics',
    ],
  },
  {
    topicId: 'strategy-candle-signals',
    title: 'Candle Signals',
    summary: 'Candle Signals is a strategy built around the idea that individual candles and small candle formations can reveal short-term shifts in pressure, hesitation, rejection, or reversal. It is less about treating patterns as promises and more about reading them as compact clues about market behavior.',
    content:
      "What this means\n\nUsing candlestick patterns to read behaviour.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: rejection or hesitation.\n\nWhat you're looking for\n\nLook for rejection or hesitation.\n\nWhy it can work\n\nWorks as real-time signal.\n\nWhat can go wrong\n\nFails if used alone.\n\nCommon misunderstanding\n\nRelying on one candle.\n\nQuick overview\n\nCandle Signals focuses on what candlesticks may be saying about market behavior in the moment.\n\nWho this strategy tends to suit\n\nThis strategy often suits visually oriented users who like reading price action directly and who are comfortable working with small, fast clues rather than waiting only for slower structural confirmation.\n\nWhat this strategy is trying to do\n\nThe goal is to identify short-term signals of reversal, rejection, exhaustion, or continuation by reading candle behavior in context.\n\nConditions it tends to like\n\nclear price action around meaningful levels\n\nmoments where buyers and sellers are visibly contesting control\n\npatterns that form near support, resistance, or other relevant structure\n\nenvironments where candle behavior adds useful context rather than random noise\n\nConditions it tends to dislike\n\nmessy low-clarity chop\n\ncandle patterns forming in the middle of nowhere\n\nover-reliance on one candle without broader context\n\nenvironments where fast noise overwhelms readable structure\n\nHow this appears in PocketPilot\n\nPocketPilot should frame this strategy around pattern formation, strengthening, confirmation, invalidation, and resolution.\n\nConditions this strategy tends to like\n\nThis strategy tends to work best when the chart is readable enough that small formations actually mean something.\n\nConditions this strategy tends to dislike\n\nThis strategy struggles when candle shapes are technically visible but strategically meaningless.\n\nRisk and readiness\n\nThe main risk is over-reading small evidence.\n\nCommon misunderstandings\n\nA candle pattern is always reliable.\n\nPattern name is all that matters.\n\nOne strong candle means the market has turned.\n\nThis strategy is separate from the rest of the market context.\n\nWorked example\n\nImagine price drops into an area that has mattered before, then prints a candle with a long lower wick and a strong close back upward. A user through this lens asks where it happened, what the rejection suggests, and whether the signal is forming, strengthening, or losing relevance.\n\nKey terms to know\n\nRejection wick\n\nEngulfing pattern\n\nHammer / shooting star\n\nConfirmation\n\nInvalidation\n\nHow it behaves\n\nCandle Signals use individual or grouped candles as context clues about buying and selling behaviour. Their meaning depends heavily on where they appear.\n\nWhat strengthens it\n\nclear location near meaningful levels\n\nalignment with broader context\n\nconfirmation from surrounding candles\n\nWhat weakens it\n\nappearing in random or noisy areas\n\nconflicting surrounding behaviour\n\nlack of follow-through\n\nHow it tends to fail\n\nCandles can mislead when taken in isolation. Patterns may appear without meaningful context and fail quickly.\n\nHow it connects to planning\n\nEntry price reflects where the signal is being interpreted. Stop-loss price defines invalidation if behaviour does not follow through. Target price acts as a review point if movement develops. Prepared planning levels can provide structural context. Risk amount and risk percent manage uncertainty. Guardrails help highlight when signals appear in weak context.\n\nWhat to watch for\n\ntreating patterns as standalone signals\n\nignoring location and context\n\noverinterpreting single candles",
    mediaType: 'ARTICLE',
    difficulty: 'INTERMEDIATE',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Using candlestick patterns to read behaviour.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: rejection or hesitation.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for rejection or hesitation.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works as real-time signal.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Fails if used alone.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Relying on one candle.',
        ],
      },
      {
        heading: 'Quick overview',
        body: [
          'Candle Signals focuses on what candlesticks may be saying about market behavior in the moment.',
        ],
      },
      {
        heading: 'Who this strategy tends to suit',
        body: [
          'This strategy often suits visually oriented users who like reading price action directly and who are comfortable working with small, fast clues rather than waiting only for slower structural confirmation.',
        ],
      },
      {
        heading: 'What this strategy is trying to do',
        body: [
          'The goal is to identify short-term signals of reversal, rejection, exhaustion, or continuation by reading candle behavior in context.',
        ],
      },
      {
        heading: 'Conditions it tends to like',
        body: [
          'clear price action around meaningful levels',
          'moments where buyers and sellers are visibly contesting control',
          'patterns that form near support, resistance, or other relevant structure',
          'environments where candle behavior adds useful context rather than random noise',
        ],
      },
      {
        heading: 'Conditions it tends to dislike',
        body: [
          'messy low-clarity chop',
          'candle patterns forming in the middle of nowhere',
          'over-reliance on one candle without broader context',
          'environments where fast noise overwhelms readable structure',
        ],
      },
      {
        heading: 'How this appears in PocketPilot',
        body: [
          'PocketPilot should frame this strategy around pattern formation, strengthening, confirmation, invalidation, and resolution.',
        ],
      },
      {
        heading: 'Conditions this strategy tends to like',
        body: [
          'This strategy tends to work best when the chart is readable enough that small formations actually mean something.',
        ],
      },
      {
        heading: 'Conditions this strategy tends to dislike',
        body: [
          'This strategy struggles when candle shapes are technically visible but strategically meaningless.',
        ],
      },
      {
        heading: 'Risk and readiness',
        body: [
          'The main risk is over-reading small evidence.',
        ],
      },
      {
        heading: 'Common misunderstandings',
        body: [
          'A candle pattern is always reliable.',
          'Pattern name is all that matters.',
          'One strong candle means the market has turned.',
          'This strategy is separate from the rest of the market context.',
        ],
      },
      {
        heading: 'Worked example',
        body: [
          'Imagine price drops into an area that has mattered before, then prints a candle with a long lower wick and a strong close back upward. A user through this lens asks where it happened, what the rejection suggests, and whether the signal is forming, strengthening, or losing relevance.',
        ],
      },
      {
        heading: 'Key terms to know',
        body: [
          'Rejection wick',
          'Engulfing pattern',
          'Hammer / shooting star',
          'Confirmation',
          'Invalidation',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Candle Signals use individual or grouped candles as context clues about buying and selling behaviour. Their meaning depends heavily on where they appear.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'clear location near meaningful levels',
          'alignment with broader context',
          'confirmation from surrounding candles',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'appearing in random or noisy areas',
          'conflicting surrounding behaviour',
          'lack of follow-through',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'Candles can mislead when taken in isolation. Patterns may appear without meaningful context and fail quickly.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price reflects where the signal is being interpreted. Stop-loss price defines invalidation if behaviour does not follow through. Target price acts as a review point if movement develops. Prepared planning levels can provide structural context. Risk amount and risk percent manage uncertainty. Guardrails help highlight when signals appear in weak context.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'treating patterns as standalone signals',
          'ignoring location and context',
          'overinterpreting single candles',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-a-marketevent-is',
      'pp-forming-developing-confirming-resolved',
      'pp-estimated-vs-confirmed-context',
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-market-regime-means',
    ],
  },
  {
    topicId: 'strategy-confluence-alignment',
    title: 'Confluence Alignment',
    summary: 'Confluence Alignment is a strategy built around the idea that a market setup becomes more meaningful when different kinds of evidence point in the same direction. It is less about finding more reasons to act and more about filtering out weak or isolated signals until the broader picture makes clearer sense.',
    content:
      "What this means\n\nCombining multiple signals.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: alignment.\n\nWhat you're looking for\n\nLook for alignment.\n\nWhy it can work\n\nWorks because agreement builds confidence.\n\nWhat can go wrong\n\nFails if forced.\n\nCommon misunderstanding\n\nMore signals = better trade.\n\nWhat this strategy is for\n\nConfluence Alignment is for situations where different kinds of evidence begin pointing to the same area or idea.\n\nWhat it looks for\n\nIt starts with confluence, meaning layered agreement rather than repeated copies of the same signal.\n\nWhat improves fit\n\nFit improves when the agreement is independent and strong enough to support meaningful change in interpretation. As the market proves the read more clearly, confirmed confidence can improve.\n\nWhat weakens fit\n\nFit weakens when the “confluence” is really just clutter or when the evidence stack starts breaking apart under stress.\n\nWhat PocketPilot would emphasize\n\nConfluence is disciplined agreement, not magical certainty.\n\nWhat a user should learn\n\nMore indicators do not automatically mean more truth.\n\nWhat to read next\n\nBitcoin’s $19k–$20k Bottoming Cluster and the Post-FTX Reclaim\n\nConfluence vs Clutter\n\nsupporting signals vs clutter explainer\n\nHow it behaves\n\nConfluence Alignment looks for multiple independent clues pointing in a similar direction. It focuses on agreement across different types of information.\n\nWhat strengthens it\n\nindependent signals aligning\n\nclear overlap between structure, momentum, and context\n\nsimplicity in interpretation\n\nWhat weakens it\n\nsignals that are similar or redundant\n\nconflicting information\n\novercomplication\n\nHow it tends to fail\n\nStacking weak or related signals can create false confidence. Alignment does not make the outcome certain.\n\nHow it connects to planning\n\nEntry price reflects where alignment is interpreted. Stop-loss price defines invalidation if alignment breaks. Target price acts as a review point if alignment holds. Prepared planning levels provide initial structure. Risk amount and risk percent manage exposure across aligned setups. Guardrails highlight when complexity increases risk.\n\nWhat to watch for\n\nassuming more signals means better clarity\n\nusing overlapping indicators\n\nforcing alignment where it does not exist",
    mediaType: 'ARTICLE',
    difficulty: 'INTERMEDIATE',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Combining multiple signals.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: alignment.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for alignment.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works because agreement builds confidence.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Fails if forced.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'More signals = better trade.',
        ],
      },
      {
        heading: 'What this strategy is for',
        body: [
          'Confluence Alignment is for situations where different kinds of evidence begin pointing to the same area or idea.',
        ],
      },
      {
        heading: 'What it looks for',
        body: [
          'It starts with confluence, meaning layered agreement rather than repeated copies of the same signal.',
        ],
      },
      {
        heading: 'What improves fit',
        body: [
          'Fit improves when the agreement is independent and strong enough to support meaningful change in interpretation. As the market proves the read more clearly, confirmed confidence can improve.',
        ],
      },
      {
        heading: 'What weakens fit',
        body: [
          'Fit weakens when the “confluence” is really just clutter or when the evidence stack starts breaking apart under stress.',
        ],
      },
      {
        heading: 'What PocketPilot would emphasize',
        body: [
          'Confluence is disciplined agreement, not magical certainty.',
        ],
      },
      {
        heading: 'What a user should learn',
        body: [
          'More indicators do not automatically mean more truth.',
        ],
      },
      {
        heading: 'What to read next',
        body: [
          'Bitcoin’s $19k–$20k Bottoming Cluster and the Post-FTX Reclaim',
          'Confluence vs Clutter',
          'supporting signals vs clutter explainer',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Confluence Alignment looks for multiple independent clues pointing in a similar direction. It focuses on agreement across different types of information.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'independent signals aligning',
          'clear overlap between structure, momentum, and context',
          'simplicity in interpretation',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'signals that are similar or redundant',
          'conflicting information',
          'overcomplication',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'Stacking weak or related signals can create false confidence. Alignment does not make the outcome certain.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price reflects where alignment is interpreted. Stop-loss price defines invalidation if alignment breaks. Target price acts as a review point if alignment holds. Prepared planning levels provide initial structure. Risk amount and risk percent manage exposure across aligned setups. Guardrails highlight when complexity increases risk.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'assuming more signals means better clarity',
          'using overlapping indicators',
          'forcing alignment where it does not exist',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-a-marketevent-is',
      'pp-estimated-vs-confirmed-context',
      'strategy-fibonacci-zones',
      'strategy-candle-signals',
    ],
  },
  {
    topicId: 'strategy-fibonacci-zones',
    title: 'Fibonacci Zones',
    summary: 'Fibonacci Zones is a strategy built around the idea that markets often pause, react, or reverse around certain retracement and extension areas after a meaningful move. It is less about treating those zones like magical numbers and more about using them as structured reference points inside a broader market context.',
    content:
      "What this means\n\nUsing retracement levels to find reactions.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: pullbacks into levels.\n\nWhat you're looking for\n\nLook for pullbacks into levels.\n\nWhy it can work\n\nWorks because many watch them.\n\nWhat can go wrong\n\nFails if ignored.\n\nCommon misunderstanding\n\nThinking they always work.\n\nQuick overview\n\nFibonacci Zones focuses on areas where a market may pause, react, or change character after a strong move.\n\nWho this strategy tends to suit\n\nThis strategy often suits users who like structure, visual reference points, and layered context.\n\nWhat this strategy is trying to do\n\nThe goal is to use retracement and extension areas as structured context for where price may react, stall, continue, or reverse.\n\nConditions it tends to like\n\na clear prior move to measure from\n\nmarkets where structure is readable\n\nreactions happening near meaningful levels\n\nsituations where Fibonacci areas line up with other useful context\n\nConditions it tends to dislike\n\nrandom, structureless markets\n\nforcing levels onto weak or messy price action\n\ntreating one ratio as decisive without broader context\n\nenvironments where nothing else is supporting the zone’s relevance\n\nHow this appears in PocketPilot\n\nPocketPilot should frame this strategy around measured zones, likely reaction areas, and confluence rather than presenting Fibonacci levels as destiny.\n\nConditions this strategy tends to like\n\nThis strategy tends to work best when the prior market move is clear enough to measure and the surrounding structure is readable.\n\nConditions this strategy tends to dislike\n\nThis strategy struggles when the chart is too messy for measurement to mean much.\n\nRisk and readiness\n\nThe main risk is false precision.\n\nCommon misunderstandings\n\nFibonacci levels are magical.\n\nIf price reaches a Fibonacci level, it must react.\n\nOne ratio is enough by itself.\n\nThis strategy is about exact numbers.\n\nWorked example\n\nImagine an asset makes a strong upward move, then begins pulling back. A user through this lens asks what part of the prior move is being retraced, whether price is entering an area that often becomes interesting, and whether the zone lines up with anything else meaningful.\n\nKey terms to know\n\nRetracement\n\nExtension\n\nSwing high / swing low\n\nConfluence\n\nZone\n\nHow it behaves\n\nFibonacci Zones identify areas where price may react during retracements or extensions. These are zones of interest rather than exact levels.\n\nWhat strengthens it\n\nalignment with existing support or resistance\n\nuse within a clear trend or structure\n\nclustering of multiple levels\n\nWhat weakens it\n\nisolated levels without context\n\nunclear trend direction\n\nconflicting signals\n\nHow it tends to fail\n\nPrice may ignore zones entirely or pass through them without reacting. Lines do not enforce behaviour.\n\nHow it connects to planning\n\nEntry price reflects where the zone is being interpreted. Stop-loss price defines invalidation beyond the zone. Target price acts as a review point at further zones. Prepared planning levels can include Fibonacci context. Risk amount and risk percent manage exposure. Guardrails highlight overreliance on single tools.\n\nWhat to watch for\n\ntreating levels as precise predictions\n\nignoring broader structure\n\noverloading charts with levels",
    mediaType: 'ARTICLE',
    difficulty: 'INTERMEDIATE',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Using retracement levels to find reactions.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: pullbacks into levels.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for pullbacks into levels.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works because many watch them.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Fails if ignored.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Thinking they always work.',
        ],
      },
      {
        heading: 'Quick overview',
        body: [
          'Fibonacci Zones focuses on areas where a market may pause, react, or change character after a strong move.',
        ],
      },
      {
        heading: 'Who this strategy tends to suit',
        body: [
          'This strategy often suits users who like structure, visual reference points, and layered context.',
        ],
      },
      {
        heading: 'What this strategy is trying to do',
        body: [
          'The goal is to use retracement and extension areas as structured context for where price may react, stall, continue, or reverse.',
        ],
      },
      {
        heading: 'Conditions it tends to like',
        body: [
          'a clear prior move to measure from',
          'markets where structure is readable',
          'reactions happening near meaningful levels',
          'situations where Fibonacci areas line up with other useful context',
        ],
      },
      {
        heading: 'Conditions it tends to dislike',
        body: [
          'random, structureless markets',
          'forcing levels onto weak or messy price action',
          'treating one ratio as decisive without broader context',
          'environments where nothing else is supporting the zone’s relevance',
        ],
      },
      {
        heading: 'How this appears in PocketPilot',
        body: [
          'PocketPilot should frame this strategy around measured zones, likely reaction areas, and confluence rather than presenting Fibonacci levels as destiny.',
        ],
      },
      {
        heading: 'Conditions this strategy tends to like',
        body: [
          'This strategy tends to work best when the prior market move is clear enough to measure and the surrounding structure is readable.',
        ],
      },
      {
        heading: 'Conditions this strategy tends to dislike',
        body: [
          'This strategy struggles when the chart is too messy for measurement to mean much.',
        ],
      },
      {
        heading: 'Risk and readiness',
        body: [
          'The main risk is false precision.',
        ],
      },
      {
        heading: 'Common misunderstandings',
        body: [
          'Fibonacci levels are magical.',
          'If price reaches a Fibonacci level, it must react.',
          'One ratio is enough by itself.',
          'This strategy is about exact numbers.',
        ],
      },
      {
        heading: 'Worked example',
        body: [
          'Imagine an asset makes a strong upward move, then begins pulling back. A user through this lens asks what part of the prior move is being retraced, whether price is entering an area that often becomes interesting, and whether the zone lines up with anything else meaningful.',
        ],
      },
      {
        heading: 'Key terms to know',
        body: [
          'Retracement',
          'Extension',
          'Swing high / swing low',
          'Confluence',
          'Zone',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Fibonacci Zones identify areas where price may react during retracements or extensions. These are zones of interest rather than exact levels.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'alignment with existing support or resistance',
          'use within a clear trend or structure',
          'clustering of multiple levels',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'isolated levels without context',
          'unclear trend direction',
          'conflicting signals',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'Price may ignore zones entirely or pass through them without reacting. Lines do not enforce behaviour.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price reflects where the zone is being interpreted. Stop-loss price defines invalidation beyond the zone. Target price acts as a review point at further zones. Prepared planning levels can include Fibonacci context. Risk amount and risk percent manage exposure. Guardrails highlight overreliance on single tools.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'treating levels as precise predictions',
          'ignoring broader structure',
          'overloading charts with levels',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-market-regime-means',
      'pp-what-a-marketevent-is',
      'pp-estimated-vs-confirmed-context',
      'strategy-confluence-alignment',
    ],
  },
  {
    topicId: 'strategy-momentum-pulse',
    title: 'Momentum Pulse',
    summary: 'Momentum Pulse is a strategy built around short-term bursts of accelerating price movement. It is less about following a long trend from afar and more about recognizing when a move is gaining speed fast enough to become temporarily meaningful.',
    content:
      "What this means\n\nTrading strong fast movement.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: sharp moves and follow-through.\n\nWhat you're looking for\n\nLook for sharp moves and follow-through.\n\nWhy it can work\n\nWorks because momentum carries price.\n\nWhat can go wrong\n\nFails if move fades.\n\nCommon misunderstanding\n\nChasing late.\n\nQuick overview\n\nMomentum Pulse is designed for moments when price movement suddenly accelerates.\n\nWho this strategy tends to suit\n\nThis strategy often suits active users who are comfortable with shorter-duration setups and closer monitoring.\n\nWhat this strategy is trying to do\n\nThe goal is to participate in a short-term burst of price acceleration while that burst still has energy.\n\nConditions it tends to like\n\nvisibly increasing speed of price movement\n\nstrong participation and volume\n\ncleaner short-term directional movement\n\nconditions where acceleration looks real rather than random\n\nConditions it tends to dislike\n\nsideways and choppy markets\n\nlow-liquidity moves\n\nbrief spikes that reverse immediately\n\nenvironments where acceleration looks fragile rather than sustained even for the short term\n\nHow this appears in PocketPilot\n\nPocketPilot should frame this strategy around pace, energy, and whether a move is accelerating or fading.\n\nConditions this strategy tends to like\n\nThis strategy tends to work best when the market is not just moving, but moving faster in a way that looks well-supported.\n\nConditions this strategy tends to dislike\n\nThis strategy struggles when the market is noisy rather than energetic.\n\nRisk and readiness\n\nThe main risk is the sudden reversal after entry.\n\nCommon misunderstandings\n\nMomentum means the asset must be fundamentally strong.\n\nThis is the same as trend-following.\n\nIf price is moving fast, that alone is enough.\n\nA strong pulse should keep going indefinitely.\n\nWorked example\n\nImagine an asset begins climbing much faster than its recent pace. A user through a Momentum Pulse lens is asking whether the move is accelerating, whether the speed looks well-supported, and whether the pulse is still active or starting to flatten out.\n\nKey terms to know\n\nMomentum\n\nVelocity\n\nVolume participation\n\nWhipsaw\n\nChoppy market\n\nHow it behaves\n\nMomentum Pulse responds to rapid price acceleration over short periods. These moves can be strong but often short-lived.\n\nWhat strengthens it\n\nclear directional acceleration\n\nstrong follow-through over short intervals\n\nalignment with broader context\n\nWhat weakens it\n\nslowing movement after a burst\n\nconflicting signals\n\nlack of continuation\n\nHow it tends to fail\n\nMomentum can fade quickly. Price may stall or reverse once the initial burst ends.\n\nHow it connects to planning\n\nEntry price reflects where momentum is being interpreted. Stop-loss price defines invalidation if momentum fades. Target price acts as a review point during fast movement. Prepared planning levels provide optional context for extension zones. Risk amount and risk percent manage exposure during fast conditions. Guardrails help highlight when chasing behaviour increases risk.\n\nWhat to watch for\n\nchasing late-stage momentum\n\nassuming speed equals continuation\n\nignoring signs of exhaustion",
    mediaType: 'ARTICLE',
    difficulty: 'INTERMEDIATE',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Trading strong fast movement.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: sharp moves and follow-through.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for sharp moves and follow-through.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works because momentum carries price.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Fails if move fades.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Chasing late.',
        ],
      },
      {
        heading: 'Quick overview',
        body: [
          'Momentum Pulse is designed for moments when price movement suddenly accelerates.',
        ],
      },
      {
        heading: 'Who this strategy tends to suit',
        body: [
          'This strategy often suits active users who are comfortable with shorter-duration setups and closer monitoring.',
        ],
      },
      {
        heading: 'What this strategy is trying to do',
        body: [
          'The goal is to participate in a short-term burst of price acceleration while that burst still has energy.',
        ],
      },
      {
        heading: 'Conditions it tends to like',
        body: [
          'visibly increasing speed of price movement',
          'strong participation and volume',
          'cleaner short-term directional movement',
          'conditions where acceleration looks real rather than random',
        ],
      },
      {
        heading: 'Conditions it tends to dislike',
        body: [
          'sideways and choppy markets',
          'low-liquidity moves',
          'brief spikes that reverse immediately',
          'environments where acceleration looks fragile rather than sustained even for the short term',
        ],
      },
      {
        heading: 'How this appears in PocketPilot',
        body: [
          'PocketPilot should frame this strategy around pace, energy, and whether a move is accelerating or fading.',
        ],
      },
      {
        heading: 'Conditions this strategy tends to like',
        body: [
          'This strategy tends to work best when the market is not just moving, but moving faster in a way that looks well-supported.',
        ],
      },
      {
        heading: 'Conditions this strategy tends to dislike',
        body: [
          'This strategy struggles when the market is noisy rather than energetic.',
        ],
      },
      {
        heading: 'Risk and readiness',
        body: [
          'The main risk is the sudden reversal after entry.',
        ],
      },
      {
        heading: 'Common misunderstandings',
        body: [
          'Momentum means the asset must be fundamentally strong.',
          'This is the same as trend-following.',
          'If price is moving fast, that alone is enough.',
          'A strong pulse should keep going indefinitely.',
        ],
      },
      {
        heading: 'Worked example',
        body: [
          'Imagine an asset begins climbing much faster than its recent pace. A user through a Momentum Pulse lens is asking whether the move is accelerating, whether the speed looks well-supported, and whether the pulse is still active or starting to flatten out.',
        ],
      },
      {
        heading: 'Key terms to know',
        body: [
          'Momentum',
          'Velocity',
          'Volume participation',
          'Whipsaw',
          'Choppy market',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Momentum Pulse responds to rapid price acceleration over short periods. These moves can be strong but often short-lived.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'clear directional acceleration',
          'strong follow-through over short intervals',
          'alignment with broader context',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'slowing movement after a burst',
          'conflicting signals',
          'lack of continuation',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'Momentum can fade quickly. Price may stall or reverse once the initial burst ends.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price reflects where momentum is being interpreted. Stop-loss price defines invalidation if momentum fades. Target price acts as a review point during fast movement. Prepared planning levels provide optional context for extension zones. Risk amount and risk percent manage exposure during fast conditions. Guardrails help highlight when chasing behaviour increases risk.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'chasing late-stage momentum',
          'assuming speed equals continuation',
          'ignoring signs of exhaustion',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-market-regime-means',
      'pp-what-a-marketevent-is',
      'pp-estimated-vs-confirmed-context',
      'pp-risk-reward-basics',
    ],
  },
  {
    topicId: 'strategy-range-trader',
    title: 'Range Trader',
    summary: 'Range Trader is a strategy built around markets that are moving sideways inside a reasonably clear floor-and-ceiling structure. It is less about chasing big directional moves and more about recognizing when price is oscillating inside a contained environment.',
    content:
      "What this means\n\nBuying low and selling high in a sideways range.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: clear highs and lows.\n\nWhat you're looking for\n\nLook for clear highs and lows.\n\nWhy it can work\n\nWorks when price repeats behaviour.\n\nWhat can go wrong\n\nFails if price breaks out.\n\nCommon misunderstanding\n\nAssuming the range will hold.\n\nWhat this strategy is for\n\nRange Trader is for markets moving inside a range rather than trending strongly.\n\nWhat it looks for\n\nIt cares about where price is inside the box and whether the market is being pushed away in rejection rather than escaping into something more directional.\n\nWhat improves fit\n\nFit improves when the boundaries keep mattering and volatility is active but not chaotic enough to make the box meaningless.\n\nWhat weakens fit\n\nFit weakens when the range is degrading, repeated tests are wearing the zone down, or a more durable escape is beginning.\n\nHow it behaves\n\nRange Trader responds to price moving between relatively stable upper and lower boundaries. Price tends to oscillate between these areas rather than trend strongly in one direction.\n\nWhat strengthens it\n\nclearly defined boundaries that price respects repeatedly\n\nrelatively stable volatility within the range\n\nconsistent behaviour at extremes\n\nWhat weakens it\n\nuneven or expanding boundaries\n\ninconsistent reactions at range edges\n\nincreasing momentum toward a breakout\n\nHow it tends to fail\n\nRanges eventually break. Price can move beyond boundaries and not return, turning a range into a directional move.\n\nHow it connects to planning\n\nEntry price helps define where within the range the idea is being interpreted. Stop-loss price helps define invalidation if the range breaks. Target price acts as a review point near the opposite boundary. Prepared planning levels can help frame the range but should be reviewed. Risk amount and risk percent keep exposure consistent across repeated plans. Guardrails help highlight when behaviour shifts away from range conditions.\n\nWhat to watch for\n\ntreating boundaries as fixed rules\n\nignoring signs of breakout pressure\n\ntrading in the middle of the range without clear context",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Buying low and selling high in a sideways range.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: clear highs and lows.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for clear highs and lows.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works when price repeats behaviour.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Fails if price breaks out.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Assuming the range will hold.',
        ],
      },
      {
        heading: 'What this strategy is for',
        body: [
          'Range Trader is for markets moving inside a range rather than trending strongly.',
        ],
      },
      {
        heading: 'What it looks for',
        body: [
          'It cares about where price is inside the box and whether the market is being pushed away in rejection rather than escaping into something more directional.',
        ],
      },
      {
        heading: 'What improves fit',
        body: [
          'Fit improves when the boundaries keep mattering and volatility is active but not chaotic enough to make the box meaningless.',
        ],
      },
      {
        heading: 'What weakens fit',
        body: [
          'Fit weakens when the range is degrading, repeated tests are wearing the zone down, or a more durable escape is beginning.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Range Trader responds to price moving between relatively stable upper and lower boundaries. Price tends to oscillate between these areas rather than trend strongly in one direction.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'clearly defined boundaries that price respects repeatedly',
          'relatively stable volatility within the range',
          'consistent behaviour at extremes',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'uneven or expanding boundaries',
          'inconsistent reactions at range edges',
          'increasing momentum toward a breakout',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'Ranges eventually break. Price can move beyond boundaries and not return, turning a range into a directional move.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price helps define where within the range the idea is being interpreted. Stop-loss price helps define invalidation if the range breaks. Target price acts as a review point near the opposite boundary. Prepared planning levels can help frame the range but should be reviewed. Risk amount and risk percent keep exposure consistent across repeated plans. Guardrails help highlight when behaviour shifts away from range conditions.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'treating boundaries as fixed rules',
          'ignoring signs of breakout pressure',
          'trading in the middle of the range without clear context',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-strategy-status-means',
      'pp-what-market-regime-means',
      'pp-estimated-vs-confirmed-context',
      'pp-risk-reward-basics',
    ],
  },
  {
    topicId: 'strategy-reversion-bounce',
    title: 'Reversion Bounce',
    summary: 'Reversion Bounce is a strategy built around the idea that severe, fast downward moves can sometimes produce a short-lived rebound. It is less about calling a long-term recovery and more about recognizing when a market may be temporarily overstretched and capable of snapping back toward a more normal level.',
    content:
      'What this means\n\nTrading a move back after price stretches too far.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: sharp moves and slowing.\n\nWhat you\'re looking for\n\nLook for sharp moves and slowing.\n\nWhy it can work\n\nWorks because price rarely moves in straight lines.\n\nWhat can go wrong\n\nFails if move continues.\n\nCommon misunderstanding\n\nEntering too early.\n\nWhat this strategy is for\n\nReversion Bounce is for situations where price has become stretched enough that a rebound becomes possible even if durable repair is not yet proven.\n\nWhat it looks for\n\nIt often begins with exhaustion and the first improvement often looks like a relief rally, not a clean reversal.\n\nWhat improves fit\n\nFit improves when the move is stretched enough to justify rebound attention and estimated confidence can improve without the product claiming a full reversal.\n\nWhat weakens fit\n\nFit weakens when rebounds keep failing to become real recovery, or when the broader structure remains too damaged to trust the bounce.\n\nWhat PocketPilot would emphasize\n\nPossible rebound conditions are not the same thing as “the low is in.”\n\nWhat a user should learn\n\nRelief and recovery are not the same thing.\n\nWhat to read next\n\nBitcoin June to August 2022: Relief Rally Inside a Broken Structure\n\nBounce vs Recovery vs Reversal\n\nrelief rally vs recovery explainer\n\nHow it behaves\n\nReversion Bounce responds to stretched price movement that may move back toward a more typical level. These moves often occur after sharp directional pressure.\n\nWhat strengthens it\n\nclear signs of overextension\n\nslowing movement after a strong push\n\nproximity to areas where price previously stabilised\n\nWhat weakens it\n\ncontinued strong directional pressure\n\nabsence of any slowing behaviour\n\nunclear reference point for "normal" levels\n\nHow it tends to fail\n\nPrice may continue moving in the same direction without reverting. What appears stretched can become more stretched.\n\nHow it connects to planning\n\nEntry price reflects where the stretched move is being interpreted. Stop-loss price defines where continuation invalidates the bounce idea. Target price acts as a review point if price moves back toward balance. Prepared planning levels provide optional context for mean areas. Risk amount and risk percent manage downside if continuation occurs. Guardrails highlight when conditions remain directional rather than reverting.\n\nWhat to watch for\n\nassuming reversion must happen\n\nentering too early without signs of slowing\n\nconfusing a bounce with a full reversal',
    mediaType: 'ARTICLE',
    difficulty: 'INTERMEDIATE',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Trading a move back after price stretches too far.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: sharp moves and slowing.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for sharp moves and slowing.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works because price rarely moves in straight lines.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Fails if move continues.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Entering too early.',
        ],
      },
      {
        heading: 'What this strategy is for',
        body: [
          'Reversion Bounce is for situations where price has become stretched enough that a rebound becomes possible even if durable repair is not yet proven.',
        ],
      },
      {
        heading: 'What it looks for',
        body: [
          'It often begins with exhaustion and the first improvement often looks like a relief rally, not a clean reversal.',
        ],
      },
      {
        heading: 'What improves fit',
        body: [
          'Fit improves when the move is stretched enough to justify rebound attention and estimated confidence can improve without the product claiming a full reversal.',
        ],
      },
      {
        heading: 'What weakens fit',
        body: [
          'Fit weakens when rebounds keep failing to become real recovery, or when the broader structure remains too damaged to trust the bounce.',
        ],
      },
      {
        heading: 'What PocketPilot would emphasize',
        body: [
          'Possible rebound conditions are not the same thing as “the low is in.”',
        ],
      },
      {
        heading: 'What a user should learn',
        body: [
          'Relief and recovery are not the same thing.',
        ],
      },
      {
        heading: 'What to read next',
        body: [
          'Bitcoin June to August 2022: Relief Rally Inside a Broken Structure',
          'Bounce vs Recovery vs Reversal',
          'relief rally vs recovery explainer',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Reversion Bounce responds to stretched price movement that may move back toward a more typical level. These moves often occur after sharp directional pressure.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'clear signs of overextension',
          'slowing movement after a strong push',
          'proximity to areas where price previously stabilised',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'continued strong directional pressure',
          'absence of any slowing behaviour',
          'unclear reference point for "normal" levels',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'Price may continue moving in the same direction without reverting. What appears stretched can become more stretched.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price reflects where the stretched move is being interpreted. Stop-loss price defines where continuation invalidates the bounce idea. Target price acts as a review point if price moves back toward balance. Prepared planning levels provide optional context for mean areas. Risk amount and risk percent manage downside if continuation occurs. Guardrails highlight when conditions remain directional rather than reverting.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'assuming reversion must happen',
          'entering too early without signs of slowing',
          'confusing a bounce with a full reversal',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-market-regime-means',
      'pp-estimated-vs-confirmed-context',
      'pp-stop-loss-basics',
      'pp-risk-reward-basics',
    ],
  },
  {
    topicId: 'strategy-trend-follow',
    title: 'Trend Follow',
    summary: 'Trend Follow is a strategy built around the idea that markets can move in sustained directions for longer than people expect. It is less about buying the exact bottom or selling the exact top, and more about recognizing when a directional move is established enough to follow.',
    content:
      "What this means\n\nTrading in the direction price is moving.\n\nWhen it shows up\n\nThis strategy is most relevant in conditions like: consistent direction and pullbacks.\n\nWhat you're looking for\n\nLook for consistent direction and pullbacks.\n\nWhy it can work\n\nWorks because trends persist.\n\nWhat can go wrong\n\nFails if trend reverses.\n\nCommon misunderstanding\n\nEntering too late.\n\nWhat this strategy is for\n\nTrend Follow is for situations where the market is already moving directionally and continuing to behave that way.\n\nWhat it looks for\n\nIt often becomes more relevant after a breakout, reclaim, or broader structural shift.\n\nWhat improves fit\n\nStrategy fit improves when the broader regime is supportive and the market keeps proving the direction.\n\nWhat weakens fit\n\nFit weakens when the direction is fragile, the environment remains damaged, or the market looks more like temporary rebound than durable continuation.\n\nWhat PocketPilot would emphasize\n\nTrend Follow is persistence-aware rather than prediction-obsessed.\n\nWhat a user should learn\n\nYou do not need the exact low for Trend Follow to matter.\n\nWhat to read next\n\nBitcoin Above the Old High\n\nFrom Liquidity Tailwind to Deleveraging Grind\n\ncontinuation vs reversal explainer\n\nHow it behaves\n\nTrend Follow responds to persistent directional movement where price continues forming structure in one direction. Trends often include pullbacks and pauses rather than moving in a straight line.\n\nWhat strengthens it\n\nconsistent directional structure\n\norderly pullbacks within the trend\n\ncontinued acceptance of higher or lower levels\n\nWhat weakens it\n\nchoppy or sideways movement\n\ninconsistent structure\n\nsigns of exhaustion or slowing\n\nHow it tends to fail\n\nTrends can stall or reverse. Price may stop progressing and begin to move sideways or shift direction entirely.\n\nHow it connects to planning\n\nEntry price reflects where within the trend the idea is being interpreted. Stop-loss price helps define where structure breaks. Target price acts as a review point as the trend progresses. Prepared planning levels can outline potential continuation areas. Risk amount and risk percent manage exposure over multiple trend attempts. Guardrails help highlight overextension or increasing risk.\n\nWhat to watch for\n\nentering late after extended movement\n\nassuming the trend will continue indefinitely\n\nignoring weakening structure",
    mediaType: 'ARTICLE',
    difficulty: 'INTERMEDIATE',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Trading in the direction price is moving.',
        ],
      },
      {
        heading: 'When it shows up',
        body: [
          'This strategy is most relevant in conditions like: consistent direction and pullbacks.',
        ],
      },
      {
        heading: "What you're looking for",
        body: [
          'Look for consistent direction and pullbacks.',
        ],
      },
      {
        heading: 'Why it can work',
        body: [
          'Works because trends persist.',
        ],
      },
      {
        heading: 'What can go wrong',
        body: [
          'Fails if trend reverses.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Entering too late.',
        ],
      },
      {
        heading: 'What this strategy is for',
        body: [
          'Trend Follow is for situations where the market is already moving directionally and continuing to behave that way.',
        ],
      },
      {
        heading: 'What it looks for',
        body: [
          'It often becomes more relevant after a breakout, reclaim, or broader structural shift.',
        ],
      },
      {
        heading: 'What improves fit',
        body: [
          'Strategy fit improves when the broader regime is supportive and the market keeps proving the direction.',
        ],
      },
      {
        heading: 'What weakens fit',
        body: [
          'Fit weakens when the direction is fragile, the environment remains damaged, or the market looks more like temporary rebound than durable continuation.',
        ],
      },
      {
        heading: 'What PocketPilot would emphasize',
        body: [
          'Trend Follow is persistence-aware rather than prediction-obsessed.',
        ],
      },
      {
        heading: 'What a user should learn',
        body: [
          'You do not need the exact low for Trend Follow to matter.',
        ],
      },
      {
        heading: 'What to read next',
        body: [
          'Bitcoin Above the Old High',
          'From Liquidity Tailwind to Deleveraging Grind',
          'continuation vs reversal explainer',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Trend Follow responds to persistent directional movement where price continues forming structure in one direction. Trends often include pullbacks and pauses rather than moving in a straight line.',
        ],
      },
      {
        heading: 'What strengthens it',
        body: [
          'consistent directional structure',
          'orderly pullbacks within the trend',
          'continued acceptance of higher or lower levels',
        ],
      },
      {
        heading: 'What weakens it',
        body: [
          'choppy or sideways movement',
          'inconsistent structure',
          'signs of exhaustion or slowing',
        ],
      },
      {
        heading: 'How it tends to fail',
        body: [
          'Trends can stall or reverse. Price may stop progressing and begin to move sideways or shift direction entirely.',
        ],
      },
      {
        heading: 'How it connects to planning',
        body: [
          'Entry price reflects where within the trend the idea is being interpreted. Stop-loss price helps define where structure breaks. Target price acts as a review point as the trend progresses. Prepared planning levels can outline potential continuation areas. Risk amount and risk percent manage exposure over multiple trend attempts. Guardrails help highlight overextension or increasing risk.',
        ],
      },
      {
        heading: 'What to watch for',
        body: [
          'entering late after extended movement',
          'assuming the trend will continue indefinitely',
          'ignoring weakening structure',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-strategy-alignment-means',
      'pp-what-strategy-fit-means',
      'pp-what-strategy-status-means',
      'pp-what-market-regime-means',
      'pp-estimated-vs-confirmed-context',
      'pp-risk-reward-basics',
    ],
  },
  {
    topicId: 'pp-what-strategy-preview-strategy-navigator-is-for',
    title: 'What Strategy Preview / Strategy Navigator Is For',
    summary:
      "Strategy Preview / Strategy Navigator is PocketPilot's exploratory bridge between learning and commitment. It helps users see how strategies change the experience before they commit.",
    content:
      "Overview\n\nStrategy Preview / Strategy Navigator is PocketPilot's exploratory bridge between learning and commitment. It helps users see how strategies change the experience before they commit.\n\nDeeper context\n\nThis feature family is designed to reduce beginner commitment anxiety by showing users how different strategies reshape the app.\n\nIt should let users:\n\nselect a strategy\n\nview a simulated scenario or event flow\n\nwatch the dashboard and signals shift under that lens\n\nIt is not a prediction engine or a forced onboarding gauntlet. It is a way to make strategy choice feel concrete instead of abstract.\n\nKey terms\n\nStrategy Preview\n\nStrategy Navigator\n\nsimulated scenario\n\nstrategy lens",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'strategies',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Strategy Preview / Strategy Navigator is PocketPilot's exploratory bridge between learning and commitment. It helps users see how strategies change the experience before they commit.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'This feature family is designed to reduce beginner commitment anxiety by showing users how different strategies reshape the app.',
          'It should let users:',
          'select a strategy',
          'view a simulated scenario or event flow',
          'watch the dashboard and signals shift under that lens',
          'It is not a prediction engine or a forced onboarding gauntlet. It is a way to make strategy choice feel concrete instead of abstract.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['Strategy Preview', 'Strategy Navigator', 'simulated scenario', 'strategy lens'],
      },
    ],
    relatedTopicIds: [
      'pp-choosing-profile-and-strategy',
      'pp-what-the-knowledge-library-is-for',
      'pp-what-dashboard-is-for',
    ],
  },
  {
    topicId: 'pp-position-sizing-basics',
    title: 'Position Sizing Basics',
    summary:
      'Position sizing is how you decide how large a trade should be relative to the risk you are taking. Even a good idea can become a bad decision if the size is wrong.',
    content:
      'Overview\n\nPosition sizing is how you decide how large a trade should be relative to the risk you are taking. Even a good idea can become a bad decision if the size is wrong.\n\nDeeper context\n\nPosition sizing answers a practical question: Given my stop, risk boundary, and plan, how big should this position be?\n\nPocketPilot treats position size as part of structured preparation. It belongs beside max loss, stop level, and risk/reward.\n\nWhy it matters\n\nThe same trade idea feels completely different at different sizes. Oversized positions create emotional pressure that can distort the whole plan.\n\nWhat it is not\n\nnot a courage contest\n\nnot proof of conviction\n\nnot something the app should silently force\n\nKey terms\n\nposition size\n\nexposure\n\nmax loss',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Position sizing is how you decide how large a trade should be relative to the risk you are taking. Even a good idea can become a bad decision if the size is wrong.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Position sizing answers a practical question: Given my stop, risk boundary, and plan, how big should this position be?',
          'PocketPilot treats position size as part of structured preparation. It belongs beside max loss, stop level, and risk/reward.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'The same trade idea feels completely different at different sizes. Oversized positions create emotional pressure that can distort the whole plan.',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not a courage contest',
          'not proof of conviction',
          'not something the app should silently force',
        ],
      },
      {
        heading: 'Key terms',
        body: ['position size', 'exposure', 'max loss'],
      },
    ],
    relatedTopicIds: [
      'pp-stop-loss-basics',
      'pp-risk-reward-basics',
      'pp-what-protection-plans-are-for',
    ],
  },
  {
    topicId: 'pp-risk-reward-basics',
    title: 'Risk/Reward Basics',
    summary:
      'Risk/reward is a way of comparing what a trade may lose if it goes wrong against what it may aim to gain if it goes well enough. It is a planning tool, not a prophecy.',
    content:
      'Overview\n\nRisk/reward is a way of comparing what a trade may lose if it goes wrong against what it may aim to gain if it goes well enough. It is a planning tool, not a prophecy.\n\nDeeper context\n\nRisk/reward helps answer: If I am wrong, what am I risking? If I am right enough, what am I aiming for?\n\nIt sits between stop-loss thinking and take-profit thinking. Once those two boundaries exist, risk/reward helps compare the overall shape of the plan.\n\nWhy it matters\n\nIt makes users compare upside and downside instead of focusing only on the exciting part of the idea.\n\nWhat it is not\n\nnot a guarantee\n\nnot proof a trade is good\n\nnot a single sacred number\n\nKey terms\n\nrisk/reward\n\ndownside\n\nupside\n\nmax loss',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Risk/reward is a way of comparing what a trade may lose if it goes wrong against what it may aim to gain if it goes well enough. It is a planning tool, not a prophecy.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Risk/reward helps answer: If I am wrong, what am I risking? If I am right enough, what am I aiming for?',
          'It sits between stop-loss thinking and take-profit thinking. Once those two boundaries exist, risk/reward helps compare the overall shape of the plan.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It makes users compare upside and downside instead of focusing only on the exciting part of the idea.',
        ],
      },
      {
        heading: 'What it is not',
        body: ['not a guarantee', 'not proof a trade is good', 'not a single sacred number'],
      },
      {
        heading: 'Key terms',
        body: ['risk/reward', 'downside', 'upside', 'max loss'],
      },
    ],
    relatedTopicIds: ['pp-stop-loss-basics', 'pp-take-profit-basics', 'pp-position-sizing-basics'],
  },
  {
    topicId: 'pp-stop-loss-basics',
    title: 'Stop Loss Basics',
    summary:
      'A stop loss is a way of deciding where a trade idea no longer makes sense or where risk should be cut. It does not make trading risk-free.',
    content:
      'Overview\n\nA stop loss is a way of deciding where a trade idea no longer makes sense or where risk should be cut. It does not make trading risk-free.\n\nDeeper context\n\nA stop loss is a risk boundary. It answers a practical question: At what point does this trade idea stop making sense for me?\n\nPocketPilot treats stop-loss logic as support, not enforcement. The calculator can help the user structure the plan, but it should not silently force behavior by default.\n\nWhy it matters\n\nWithout a stop-loss boundary, risk can become vague. Vague risk tends to become emotional risk.\n\nWhat it is not\n\nnot a guarantee of perfect execution\n\nnot magic protection\n\nnot proof the trade is good\n\nKey terms\n\nstop loss\n\ninvalidation\n\nrisk boundary',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'A stop loss is a way of deciding where a trade idea no longer makes sense or where risk should be cut. It does not make trading risk-free.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'A stop loss is a risk boundary. It answers a practical question: At what point does this trade idea stop making sense for me?',
          'PocketPilot treats stop-loss logic as support, not enforcement. The calculator can help the user structure the plan, but it should not silently force behavior by default.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Without a stop-loss boundary, risk can become vague. Vague risk tends to become emotional risk.',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not a guarantee of perfect execution',
          'not magic protection',
          'not proof the trade is good',
        ],
      },
      {
        heading: 'Key terms',
        body: ['stop loss', 'invalidation', 'risk boundary'],
      },
    ],
    relatedTopicIds: [
      'pp-take-profit-basics',
      'pp-risk-reward-basics',
      'pp-position-sizing-basics',
    ],
  },
  {
    topicId: 'pp-take-profit-basics',
    title: 'Take Profit Basics',
    summary:
      'A take profit is a way of deciding where a trade may have delivered enough of what you wanted from it. It is part of exit structure, not a promise that gains will arrive neatly.',
    content:
      'Overview\n\nA take profit is a way of deciding where a trade may have delivered enough of what you wanted from it. It is part of exit structure, not a promise that gains will arrive neatly.\n\nDeeper context\n\nA take profit is an exit target. It helps define what "good enough" looks like for the trade idea you are working with right now.\n\nPocketPilot uses take-profit logic as part of action support. It helps users clarify the reward side of the plan before emotion takes over.\n\nWhy it matters\n\nWithout a take-profit idea, users can drift into endless goalpost-moving and turn a plan into a feeling.\n\nWhat it is not\n\nnot a guarantee\n\nnot proof of a good setup\n\nnot a magical number the market owes you\n\nKey terms\n\ntake profit\n\nexit target\n\nreward structure',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'A take profit is a way of deciding where a trade may have delivered enough of what you wanted from it. It is part of exit structure, not a promise that gains will arrive neatly.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'A take profit is an exit target. It helps define what "good enough" looks like for the trade idea you are working with right now.',
          'PocketPilot uses take-profit logic as part of action support. It helps users clarify the reward side of the plan before emotion takes over.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Without a take-profit idea, users can drift into endless goalpost-moving and turn a plan into a feeling.',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not a guarantee',
          'not proof of a good setup',
          'not a magical number the market owes you',
        ],
      },
      {
        heading: 'Key terms',
        body: ['take profit', 'exit target', 'reward structure'],
      },
    ],
    relatedTopicIds: ['pp-stop-loss-basics', 'pp-risk-reward-basics', 'pp-position-sizing-basics'],
  },
  {
    topicId: 'pp-what-protection-plans-are-for',
    title: 'What Protection Plans Are For',
    summary:
      "A ProtectionPlan is PocketPilot's way of structuring risk and exit thinking before action. It supports planning, but it is not a guarantee and not forced enforcement by default.",
    content:
      'Overview\n\nA ProtectionPlan is PocketPilot\'s way of structuring risk and exit thinking before action. It supports planning, but it is not a guarantee and not forced enforcement by default.\n\nDeeper context\n\nWhen the user works through SL/TP logic in PocketPilot, the system can create a ProtectionPlan object. In plain English, that means the product can turn vague intention into a more explicit plan:\n\nwhat is the entry intent?\n\nwhere is the stop?\n\nwhere is the take-profit?\n\nwhat is the risk basis?\n\nProtectionPlans live in the support layer. They should help users think more clearly, not silently take over or pretend that risk has disappeared.\n\nWhy they matter\n\nThey make the action layer more deliberate. They help prevent the "I\'ll figure it out later" style of trading.\n\nKey terms\n\nProtectionPlan\n\nentry intent\n\nrisk basis\n\nexecution capability',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          "A ProtectionPlan is PocketPilot's way of structuring risk and exit thinking before action. It supports planning, but it is not a guarantee and not forced enforcement by default.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'When the user works through SL/TP logic in PocketPilot, the system can create a ProtectionPlan object. In plain English, that means the product can turn vague intention into a more explicit plan:',
          'what is the entry intent?',
          'where is the stop?',
          'where is the take-profit?',
          'what is the risk basis?',
          'ProtectionPlans live in the support layer. They should help users think more clearly, not silently take over or pretend that risk has disappeared.',
        ],
      },
      {
        heading: 'Why they matter',
        body: [
          'They make the action layer more deliberate. They help prevent the "I\'ll figure it out later" style of trading.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['ProtectionPlan', 'entry intent', 'risk basis', 'execution capability'],
      },
    ],
    relatedTopicIds: ['pp-stop-loss-basics', 'pp-take-profit-basics', 'pp-risk-reward-basics'],
  },
  {
    topicId: 'pp-what-event-ledger-is-for',
    title: 'What Event Ledger Is For',
    summary:
      "Event Ledger is PocketPilot's structured memory of meaningful market events and user actions over time. It preserves context so the product can support summaries, re-entry, and calmer learning later.",
    content:
      "Overview\n\nEvent Ledger is PocketPilot's structured memory of meaningful market events and user actions over time. It preserves context so the product can support summaries, re-entry, and calmer learning later.\n\nDeeper context\n\nEvent Ledger stores two broad classes of things:\n\nmarket events\n\nuser action events\n\nThe point is not to save every twitch. The point is to preserve meaningful context: what happened, when, under what strategy, and under what conditions.\n\nThat deeper memory is what allows PocketPilot to generate Since Last Checked, Reorientation, summaries, and later reflection.\n\nWhat it is not\n\nnot a giant unreadable dump\n\nnot a punishment record\n\nnot a developer-only artifact\n\nKey terms\n\nEvent Ledger\n\nmarket event\n\nuser action event\n\nevent memory",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'reflection',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Event Ledger is PocketPilot's structured memory of meaningful market events and user actions over time. It preserves context so the product can support summaries, re-entry, and calmer learning later.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Event Ledger stores two broad classes of things:',
          'market events',
          'user action events',
          'The point is not to save every twitch. The point is to preserve meaningful context: what happened, when, under what strategy, and under what conditions.',
          'That deeper memory is what allows PocketPilot to generate Since Last Checked, Reorientation, summaries, and later reflection.',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not a giant unreadable dump',
          'not a punishment record',
          'not a developer-only artifact',
        ],
      },
      {
        heading: 'Key terms',
        body: ['Event Ledger', 'market event', 'user action event', 'event memory'],
      },
    ],
    relatedTopicIds: [
      'pp-what-a-marketevent-is',
      'pp-what-since-last-checked-is-for',
      'pp-what-insights-is-for',
    ],
  },
  {
    topicId: 'pp-what-insights-is-for',
    title: 'What Insights Is For',
    summary:
      "Insights is PocketPilot's reflection and memory layer. It helps users understand what happened over time without turning the app into a shame-based scorecard or a raw history dump.",
    content:
      "Overview\n\nInsights is PocketPilot's reflection and memory layer. It helps users understand what happened over time without turning the app into a shame-based scorecard or a raw history dump.\n\nDeeper context\n\nInsights is broader than a generic history tab. It gathers the product's deeper memory and reflection surfaces, including things like:\n\nSince Last Checked\n\nReorientation\n\nEvent Ledger\n\nsummaries\n\nSummary Archive\n\nlater journal flows\n\nWhy it matters\n\nPocketPilot is not only about the present tense. Reflection helps users understand patterns, rebuild context after absence, and learn from what happened without gamification or moralizing.\n\nWhat it is not\n\nnot just old notifications\n\nnot a shame engine\n\nnot a giant event landfill\n\nKey terms\n\nInsights\n\nreflection layer\n\nmemory\n\nsummary",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'reflection',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Insights is PocketPilot's reflection and memory layer. It helps users understand what happened over time without turning the app into a shame-based scorecard or a raw history dump.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          "Insights is broader than a generic history tab. It gathers the product's deeper memory and reflection surfaces, including things like:",
          'Since Last Checked',
          'Reorientation',
          'Event Ledger',
          'summaries',
          'Summary Archive',
          'later journal flows',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'PocketPilot is not only about the present tense. Reflection helps users understand patterns, rebuild context after absence, and learn from what happened without gamification or moralizing.',
        ],
      },
      {
        heading: 'What it is not',
        body: ['not just old notifications', 'not a shame engine', 'not a giant event landfill'],
      },
      {
        heading: 'Key terms',
        body: ['Insights', 'reflection layer', 'memory', 'summary'],
      },
    ],
    relatedTopicIds: [
      'pp-what-event-ledger-is-for',
      'pp-what-summary-archive-is-for',
      'pp-what-year-in-review-is-for',
    ],
  },
  {
    topicId: 'pp-what-log-and-journal-are-for',
    title: 'What Log and Journal Are For',
    summary:
      'Log and Journal are future-facing PocketPilot reflection tools for preserving user-side context around decisions, actions, and lessons over time.',
    content:
      'Overview\n\nLog and Journal are future-facing PocketPilot reflection tools for preserving user-side context around decisions, actions, and lessons over time.\n\nDeeper context\n\nEvent Ledger can preserve what happened. Summaries can preserve what mattered across a period. A log or journal layer could help preserve the human-side context:\n\nwhy the user acted\n\nwhat they believed at the time\n\nwhat they later learned\n\nThis should remain optional. It must not become mandatory homework, streak culture, or a moral scoreboard.\n\nWhy it matters\n\nDone well, a journal layer could support clearer memory and calmer reflection. Done badly, it becomes self-improvement theatre.\n\nKey terms\n\njournal\n\nreflection note\n\ndecision context',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'reflection',
    priority: 'LATER',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Log and Journal are future-facing PocketPilot reflection tools for preserving user-side context around decisions, actions, and lessons over time.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Event Ledger can preserve what happened. Summaries can preserve what mattered across a period. A log or journal layer could help preserve the human-side context:',
          'why the user acted',
          'what they believed at the time',
          'what they later learned',
          'This should remain optional. It must not become mandatory homework, streak culture, or a moral scoreboard.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Done well, a journal layer could support clearer memory and calmer reflection. Done badly, it becomes self-improvement theatre.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['journal', 'reflection note', 'decision context'],
      },
    ],
    relatedTopicIds: [
      'pp-what-event-ledger-is-for',
      'pp-what-insights-is-for',
      'pp-what-summary-archive-is-for',
    ],
  },
  {
    topicId: 'pp-what-monthly-and-quarterly-summaries-are-for',
    title: 'What Monthly and Quarterly Summaries Are For',
    summary:
      "Monthly and Quarterly Summaries are PocketPilot's medium-horizon reflection layer. They help users understand what mattered over a meaningful stretch of time without waiting a full year for perspective.",
    content:
      "Overview\n\nMonthly and Quarterly Summaries are PocketPilot's medium-horizon reflection layer. They help users understand what mattered over a meaningful stretch of time without waiting a full year for perspective.\n\nDeeper context\n\nThese summaries sit between recent re-entry tools and long-horizon annual review. They are useful because a month or quarter is often long enough for patterns to become visible while still feeling close to the present.\n\nThey should focus on themes, changes, and recurring conditions, not every tiny event.\n\nWhat they are not\n\nnot a mini report card\n\nnot a giant digest of everything\n\nnot performance theatre\n\nKey terms\n\nmonthly summary\n\nquarterly summary\n\nmedium-horizon reflection",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'reflection',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Monthly and Quarterly Summaries are PocketPilot's medium-horizon reflection layer. They help users understand what mattered over a meaningful stretch of time without waiting a full year for perspective.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'These summaries sit between recent re-entry tools and long-horizon annual review. They are useful because a month or quarter is often long enough for patterns to become visible while still feeling close to the present.',
          'They should focus on themes, changes, and recurring conditions, not every tiny event.',
        ],
      },
      {
        heading: 'What they are not',
        body: [
          'not a mini report card',
          'not a giant digest of everything',
          'not performance theatre',
        ],
      },
      {
        heading: 'Key terms',
        body: ['monthly summary', 'quarterly summary', 'medium-horizon reflection'],
      },
    ],
    relatedTopicIds: [
      'pp-what-year-in-review-is-for',
      'pp-what-summary-archive-is-for',
      'pp-what-insights-is-for',
    ],
  },
  {
    topicId: 'pp-what-reorientation-is-for',
    title: 'What Reorientation Is For',
    summary:
      "Reorientation is PocketPilot's calm return briefing after a longer absence. It helps rebuild context without guilt, pressure, or a demand to catch up on everything.",
    content:
      "Overview\n\nReorientation is PocketPilot's calm return briefing after a longer absence. It helps rebuild context without guilt, pressure, or a demand to catch up on everything.\n\nDeeper context\n\nReorientation sits beside Since Last Checked, but it serves a different job. Since Last Checked is the short recent-change briefing. Reorientation is the broader return summary used after a meaningful gap.\n\nThe product rules matter here:\n\nauto-prepared\n\nnever forced\n\nprofile-sensitive\n\nopt-in visible\n\nalways logged\n\nWhy it exists\n\nIt helps users come back after time away and quickly understand the larger picture without turning absence into debt.\n\nWhat it is not\n\nnot a thirsty retention trick\n\nnot a shame message\n\nnot a giant catch-up feed\n\nKey terms\n\nreorientation\n\ninactivity threshold\n\ncontext rebuild",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'reflection',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Reorientation is PocketPilot's calm return briefing after a longer absence. It helps rebuild context without guilt, pressure, or a demand to catch up on everything.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Reorientation sits beside Since Last Checked, but it serves a different job. Since Last Checked is the short recent-change briefing. Reorientation is the broader return summary used after a meaningful gap.',
          'The product rules matter here:',
          'auto-prepared',
          'never forced',
          'profile-sensitive',
          'opt-in visible',
          'always logged',
        ],
      },
      {
        heading: 'Why it exists',
        body: [
          'It helps users come back after time away and quickly understand the larger picture without turning absence into debt.',
        ],
      },
      {
        heading: 'What it is not',
        body: ['not a thirsty retention trick', 'not a shame message', 'not a giant catch-up feed'],
      },
      {
        heading: 'Key terms',
        body: ['reorientation', 'inactivity threshold', 'context rebuild'],
      },
    ],
    relatedTopicIds: [
      'pp-what-since-last-checked-is-for',
      'pp-what-insights-is-for',
      'pp-what-event-ledger-is-for',
    ],
  },
  {
    topicId: 'pp-what-since-last-checked-is-for',
    title: 'What Since Last Checked Is For',
    summary:
      "Since Last Checked is PocketPilot's short briefing for meaningful change since your last visit. It is not an inbox and not a guilt mechanic.",
    content:
      "Overview\n\nSince Last Checked is PocketPilot's short briefing for meaningful change since your last visit. It is not an inbox and not a guilt mechanic.\n\nDeeper context\n\nSince Last Checked is a re-entry tool. Its job is to answer a simple question: What changed in a way that matters for my strategy?\n\nThe feature is intentionally short. It is meant to surface only meaningful state change, not every small twitch in the market. The product spec treats it as a briefing, not a backlog.\n\nWhat belongs there\n\nstrategy state shifts\n\nrelevant MarketEvents\n\nmeaningful volatility or context changes\n\nWhat does not belong there\n\ntiny price moves\n\neverything that happened\n\na punishment for not checking the app often\n\nWhy it matters\n\nIt helps users reopen the app with context instead of surprise, while keeping the tone calm and selective.\n\nKey terms\n\nSince Last Checked\n\nmeaningful change\n\nre-entry briefing",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'reflection',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Since Last Checked is PocketPilot's short briefing for meaningful change since your last visit. It is not an inbox and not a guilt mechanic.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Since Last Checked is a re-entry tool. Its job is to answer a simple question: What changed in a way that matters for my strategy?',
          'The feature is intentionally short. It is meant to surface only meaningful state change, not every small twitch in the market. The product spec treats it as a briefing, not a backlog.',
        ],
      },
      {
        heading: 'What belongs there',
        body: [
          'strategy state shifts',
          'relevant MarketEvents',
          'meaningful volatility or context changes',
        ],
      },
      {
        heading: 'What does not belong there',
        body: [
          'tiny price moves',
          'everything that happened',
          'a punishment for not checking the app often',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It helps users reopen the app with context instead of surprise, while keeping the tone calm and selective.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['Since Last Checked', 'meaningful change', 're-entry briefing'],
      },
    ],
    relatedTopicIds: [
      'pp-what-snapshot-is-for',
      'pp-what-reorientation-is-for',
      'pp-what-event-ledger-is-for',
    ],
  },
  {
    topicId: 'pp-what-summary-archive-is-for',
    title: 'What Summary Archive Is For',
    summary:
      "Summary Archive is PocketPilot's stored library of past summaries and briefings. It preserves useful context after the moment has passed.",
    content:
      "Overview\n\nSummary Archive is PocketPilot's stored library of past summaries and briefings. It preserves useful context after the moment has passed.\n\nDeeper context\n\nSummary Archive sits above Event Ledger. The ledger preserves structured event truth. The archive preserves the more human-readable summaries built from that truth.\n\nIt is where things like re-entry briefings, monthly summaries, quarterly summaries, or year-level reviews can remain available later.\n\nWhy it matters\n\nWithout an archive layer, useful summaries either vanish too quickly or clutter the front of the product.\n\nKey terms\n\nSummary Archive\n\nstored summary\n\nreflection layer",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'reflection',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Summary Archive is PocketPilot's stored library of past summaries and briefings. It preserves useful context after the moment has passed.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Summary Archive sits above Event Ledger. The ledger preserves structured event truth. The archive preserves the more human-readable summaries built from that truth.',
          'It is where things like re-entry briefings, monthly summaries, quarterly summaries, or year-level reviews can remain available later.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'Without an archive layer, useful summaries either vanish too quickly or clutter the front of the product.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['Summary Archive', 'stored summary', 'reflection layer'],
      },
    ],
    relatedTopicIds: [
      'pp-what-event-ledger-is-for',
      'pp-what-year-in-review-is-for',
      'pp-what-monthly-and-quarterly-summaries-are-for',
    ],
  },
  {
    topicId: 'pp-what-year-in-review-is-for',
    title: 'What Year in Review Is For',
    summary:
      "Year in Review is PocketPilot's longer-horizon reflective summary. It helps users step back and understand the bigger story of the year.",
    content:
      "Overview\n\nYear in Review is PocketPilot's longer-horizon reflective summary. It helps users step back and understand the bigger story of the year.\n\nDeeper context\n\nYear in Review belongs in the reflection layer, not the live surfaces. It is there to show patterns, themes, and context over a full year without turning behavior into a performance spectacle.\n\nIt should help users understand:\n\nhow market context shifted\n\nhow strategy conditions evolved\n\nwhat themes repeated\n\nwhat is worth carrying forward\n\nWhat it is not\n\nnot a brag reel\n\nnot a shame report\n\nnot app-usage theatre\n\nKey terms\n\nYear in Review\n\nannual reflection\n\nlong-horizon summary",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'reflection',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          "Year in Review is PocketPilot's longer-horizon reflective summary. It helps users step back and understand the bigger story of the year.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'Year in Review belongs in the reflection layer, not the live surfaces. It is there to show patterns, themes, and context over a full year without turning behavior into a performance spectacle.',
          'It should help users understand:',
          'how market context shifted',
          'how strategy conditions evolved',
          'what themes repeated',
          'what is worth carrying forward',
        ],
      },
      {
        heading: 'What it is not',
        body: ['not a brag reel', 'not a shame report', 'not app-usage theatre'],
      },
      {
        heading: 'Key terms',
        body: ['Year in Review', 'annual reflection', 'long-horizon summary'],
      },
    ],
    relatedTopicIds: [
      'pp-what-monthly-and-quarterly-summaries-are-for',
      'pp-what-summary-archive-is-for',
      'pp-what-insights-is-for',
    ],
  },
  {
    topicId: 'pp-what-knowledge-links-are-for',
    title: 'What Knowledge Links Are For',
    summary:
      'Knowledge Links are contextual pathways into the Knowledge Library. They offer explanation where it is useful without turning the product into a homework trap.',
    content:
      "Overview\n\nKnowledge Links are contextual pathways into the Knowledge Library. They offer explanation where it is useful without turning the product into a homework trap.\n\nDeeper context\n\nPocketPilot's knowledge layer exists both as a top-level tab and as contextual support. Knowledge Links are the in-product bridge.\n\nThey matter because users often need explanation in context, not only through separate browsing. A link from Dashboard or Trade Hub can answer a question at the exact moment the user has it.\n\nRules that matter\n\noptional\n\neasy to ignore\n\neasy to reach\n\nnever a gate\n\nSurface fit\n\nDashboard is the strongest contextual home. Trade Hub links should stay bounded. Snapshot needs extra caution.\n\nKey terms\n\nKnowledge Link\n\ncontextual support\n\nnon-gating knowledge",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'knowledge-system',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          'Knowledge Links are contextual pathways into the Knowledge Library. They offer explanation where it is useful without turning the product into a homework trap.',
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          "PocketPilot's knowledge layer exists both as a top-level tab and as contextual support. Knowledge Links are the in-product bridge.",
          'They matter because users often need explanation in context, not only through separate browsing. A link from Dashboard or Trade Hub can answer a question at the exact moment the user has it.',
        ],
      },
      {
        heading: 'Rules that matter',
        body: ['optional', 'easy to ignore', 'easy to reach', 'never a gate'],
      },
      {
        heading: 'Surface fit',
        body: [
          'Dashboard is the strongest contextual home. Trade Hub links should stay bounded. Snapshot needs extra caution.',
        ],
      },
      {
        heading: 'Key terms',
        body: ['Knowledge Link', 'contextual support', 'non-gating knowledge'],
      },
    ],
    relatedTopicIds: [
      'pp-what-the-knowledge-library-is-for',
      'pp-what-dashboard-is-for',
      'pp-what-trade-hub-is-for',
    ],
  },
  {
    topicId: 'pp-what-the-knowledge-library-is-for',
    title: 'What the Knowledge Library Is For',
    summary:
      "The Knowledge Library is PocketPilot's optional learning and explanation layer. It helps users understand strategies, signals, MarketEvents, and product concepts without turning learning into a gate.",
    content:
      "Overview\n\nThe Knowledge Library is PocketPilot's optional learning and explanation layer. It helps users understand strategies, signals, MarketEvents, and product concepts without turning learning into a gate.\n\nDeeper context\n\nThe Knowledge Library exists for a simple reason: PocketPilot is an interpretation product, which means explanation has to be part of the system, not an afterthought.\n\nThe library exists in two forms:\n\na persistent top-level tab\n\na contextual support layer attached to strategies, signals, and events\n\nThat means users can either go looking for knowledge on purpose or receive it in context when it would genuinely help.\n\nIts job is to reduce beginner fear, support strategy selection, explain terms, and make the product easier to understand in the moment. It should make users feel more capable, not more supervised.\n\nWhat it is not\n\nnot forced reading\n\nnot a gate before execution\n\nnot a generic crypto encyclopedia\n\nWhy it matters\n\nPocketPilot helps users understand what the market means for their strategy. The Knowledge Library makes sure that understanding stays available, optional, and easy to reach when needed.\n\nKey terms\n\nKnowledge Library\n\ncontextual support layer\n\noptional learning\n\nknowledge empowers, never gatekeeps",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'knowledge-system',
    priority: 'NEXT',
    sections: [
      {
        heading: 'Overview',
        body: [
          "The Knowledge Library is PocketPilot's optional learning and explanation layer. It helps users understand strategies, signals, MarketEvents, and product concepts without turning learning into a gate.",
        ],
      },
      {
        heading: 'Deeper context',
        body: [
          'The Knowledge Library exists for a simple reason: PocketPilot is an interpretation product, which means explanation has to be part of the system, not an afterthought.',
          'The library exists in two forms:',
          'a persistent top-level tab',
          'a contextual support layer attached to strategies, signals, and events',
          'That means users can either go looking for knowledge on purpose or receive it in context when it would genuinely help.',
          'Its job is to reduce beginner fear, support strategy selection, explain terms, and make the product easier to understand in the moment. It should make users feel more capable, not more supervised.',
        ],
      },
      {
        heading: 'What it is not',
        body: [
          'not forced reading',
          'not a gate before execution',
          'not a generic crypto encyclopedia',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'PocketPilot helps users understand what the market means for their strategy. The Knowledge Library makes sure that understanding stays available, optional, and easy to reach when needed.',
        ],
      },
      {
        heading: 'Key terms',
        body: [
          'Knowledge Library',
          'contextual support layer',
          'optional learning',
          'knowledge empowers, never gatekeeps',
        ],
      },
    ],
    relatedTopicIds: [
      'pp-what-knowledge-links-are-for',
      'pp-choosing-profile-and-strategy',
      'pp-what-pocketpilot-is',
    ],
  },
  {
    topicId: 'glossary-stop-loss-price',
    title: 'Stop-loss price',
    summary: "The price where you'd exit to avoid further losses.",
    content: "Overview\n\nThe price where you'd exit to avoid further losses.",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: ["The price where you'd exit to avoid further losses."],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'glossary-target-price',
    title: 'Target price',
    summary:
      'A price you use to review whether the plan is working or whether an exit may make sense.',
    content:
      'Overview\n\nA price you use to review whether the plan is working or whether an exit may make sense.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: [
          'A price you use to review whether the plan is working or whether an exit may make sense.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'glossary-risk-amount',
    title: 'Risk amount',
    summary: 'How much money you could lose on this trade.',
    content: 'Overview\n\nHow much money you could lose on this trade.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: ['How much money you could lose on this trade.'],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'glossary-risk-percent',
    title: 'Risk percent',
    summary: 'The percentage of your account at risk.',
    content: 'Overview\n\nThe percentage of your account at risk.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: ['The percentage of your account at risk.'],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'glossary-guardrails',
    title: 'Guardrails',
    summary: 'Optional limits to help manage your risk.',
    content: 'Overview\n\nOptional limits to help manage your risk.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'core-language',
    priority: 'NOW',
    sections: [
      {
        heading: 'Overview',
        body: ['Optional limits to help manage your risk.'],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-entry-price',
    title: 'Entry price',
    summary: "The price you're planning to enter the trade.",
    content:
      "What this means\n\nThe price you're planning to enter the trade.\n\nWhy it matters\n\nThis is your starting planning input. Everything else builds from here.\n\nHow PocketPilot frames it\n\nA planning level, not a certain fill.\n\nCommon misunderstanding\n\nThinking you'll always get that exact price.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nEntry price is where your plan becomes active. It is less about finding the perfect price and more about acting when your idea is clearly defined.\n\nHow it behaves\n\nEntries can be early, confirmed, or late. Each is a trade-off between price and clarity.\n\nWhat tends to go wrong\n\nentering without a setup\n\nchasing missed moves\n\nreacting instead of planning\n\nWhat good looks like\n\nclear reason for the chosen timing\n\naligned with strategy\n\nunderstood trade-offs\n\nWhat it connects to\n\nStop-loss price, Position size, Strategy alignment.",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          "The price you're planning to enter the trade.",
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'This is your starting planning input. Everything else builds from here.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'A planning level, not a certain fill.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          "Thinking you'll always get that exact price.",
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Entry price is where your plan becomes active. It is less about finding the perfect price and more about acting when your idea is clearly defined.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Entries can be early, confirmed, or late. Each is a trade-off between price and clarity.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'entering without a setup',
          'chasing missed moves',
          'reacting instead of planning',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'clear reason for the chosen timing',
          'aligned with strategy',
          'understood trade-offs',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Stop-loss price, Position size, Strategy alignment.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-stop-loss-price',
    title: 'Stop-loss price',
    summary: "The price where you'd exit to avoid further losses.",
    content:
      "What this means\n\nThe price where you'd exit to avoid further losses.\n\nWhy it matters\n\nIt defines your downside before you act.\n\nHow PocketPilot frames it\n\nA planning level showing where the idea no longer holds up.\n\nCommon misunderstanding\n\nTreating it as just how much loss you can tolerate.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nThis is a planning boundary where your idea may no longer be valid. It is not a guarantee of where an exit occurs.\n\nHow it behaves\n\nA stop can be structural, volatility-based, or arbitrary. Structural placement is often the clearest match to plan logic.\n\nWhat tends to go wrong\n\ntoo tight for normal movement\n\nemotionally moved after entry\n\nnot set at all\n\nWhat good looks like\n\nclear invalidation point\n\naccepted loss point\n\nchosen deliberately\n\nWhat it connects to\n\nEntry price, Risk amount, Position size.",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          "The price where you'd exit to avoid further losses.",
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It defines your downside before you act.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'A planning level showing where the idea no longer holds up.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Treating it as just how much loss you can tolerate.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'This is a planning boundary where your idea may no longer be valid. It is not a guarantee of where an exit occurs.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'A stop can be structural, volatility-based, or arbitrary. Structural placement is often the clearest match to plan logic.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'too tight for normal movement',
          'emotionally moved after entry',
          'not set at all',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'clear invalidation point',
          'accepted loss point',
          'chosen deliberately',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Entry price, Risk amount, Position size.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-target-price',
    title: 'Target price',
    summary: 'A price you use to review whether the plan is working or whether an exit may make sense.',
    content:
      'What this means\n\nA price you use to review whether the plan is working or whether an exit may make sense.\n\nWhy it matters\n\nIt gives you a review point to assess progress.\n\nHow PocketPilot frames it\n\nA review point, not an automatic action. PocketPilot does not place a trade at this level.\n\nCommon misunderstanding\n\nThinking the trade will close automatically at this price.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nTarget price is a review point, not a prediction.\n\nHow it behaves\n\nTargets can be structure-based, risk-based, or adjusted as context evolves.\n\nWhat tends to go wrong\n\ntreating it as certain\n\nexiting too early without review\n\nholding too long without re-checking context\n\nWhat good looks like\n\nused to assess progress\n\nflexible, context-aware decisions\n\nWhat it connects to\n\nReward/risk, Strategy type, Market structure.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'A price you use to review whether the plan is working or whether an exit may make sense.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It gives you a review point to assess progress.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'A review point, not an automatic action. PocketPilot does not place a trade at this level.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Thinking the trade will close automatically at this price.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Target price is a review point, not a prediction.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'Targets can be structure-based, risk-based, or adjusted as context evolves.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'treating it as certain',
          'exiting too early without review',
          'holding too long without re-checking context',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'used to assess progress',
          'flexible, context-aware decisions',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Reward/risk, Strategy type, Market structure.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-prepared-planning-levels',
    title: 'Prepared planning levels',
    summary: 'Optional planning levels prepared from the selected plan.',
    content:
      'What this means\n\nOptional planning levels prepared from the selected plan.\n\nWhy it matters\n\nThey help you set up planning context quickly.\n\nHow PocketPilot frames it\n\nStarting points for review. Your own inputs remain authoritative.\n\nCommon misunderstanding\n\nThinking they are automatically applied or required.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nPrepared planning levels are optional context to help you start. They are not recommendations.\n\nHow it behaves\n\nThey provide a structured starting point, while your own inputs remain authoritative.\n\nWhat tends to go wrong\n\naccepting values without review\n\nassuming they are required\n\nWhat good looks like\n\nused as a starting point\n\nadjusted with your own reasoning\n\nWhat it connects to\n\nEntry price, Stop-loss price, Target price.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Optional planning levels prepared from the selected plan.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'They help you set up planning context quickly.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'Starting points for review. Your own inputs remain authoritative.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Thinking they are automatically applied or required.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Prepared planning levels are optional context to help you start. They are not recommendations.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'They provide a structured starting point, while your own inputs remain authoritative.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'accepting values without review',
          'assuming they are required',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'used as a starting point',
          'adjusted with your own reasoning',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Entry price, Stop-loss price, Target price.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-risk-amount',
    title: 'Risk amount',
    summary: 'How much money you could lose on this trade.',
    content:
      'What this means\n\nHow much money you could lose on this trade.\n\nWhy it matters\n\nIt shows the real downside before acting.\n\nHow PocketPilot frames it\n\nA planning output derived from your inputs.\n\nCommon misunderstanding\n\nConfusing it with general market volatility.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nRisk amount is your real downside if you are wrong. It is planning risk context, not advice.\n\nHow it behaves\n\nIt is derived from entry, stop-loss, and position size.\n\nWhat tends to go wrong\n\nignoring it\n\nunderestimating it\n\nWhat good looks like\n\nknown before entry\n\nacceptable for your plan\n\nWhat it connects to\n\nPosition size, Stop-loss price, Account size.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'How much money you could lose on this trade.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It shows the real downside before acting.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'A planning output derived from your inputs.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Confusing it with general market volatility.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Risk amount is your real downside if you are wrong. It is planning risk context, not advice.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It is derived from entry, stop-loss, and position size.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'ignoring it',
          'underestimating it',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'known before entry',
          'acceptable for your plan',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Position size, Stop-loss price, Account size.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-risk-percent',
    title: 'Risk percent',
    summary: 'The percentage of your account at risk.',
    content:
      'What this means\n\nThe percentage of your account at risk.\n\nWhy it matters\n\nIt helps keep trades consistent in size.\n\nHow PocketPilot frames it\n\nA way to size trades relative to your account.\n\nCommon misunderstanding\n\nThinking a low percent always means safe.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nRisk percent helps keep planning risk consistent across trades. It does not remove risk.\n\nHow it behaves\n\nIt standardizes risk relative to account size.\n\nWhat tends to go wrong\n\nchanging risk emotionally\n\nassuming a small percent means no meaningful downside\n\nWhat good looks like\n\nconsistent across trades\n\nstable behavior over time\n\nWhat it connects to\n\nRisk amount, Position size.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'The percentage of your account at risk.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It helps keep trades consistent in size.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'A way to size trades relative to your account.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Thinking a low percent always means safe.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Risk percent helps keep planning risk consistent across trades. It does not remove risk.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It standardizes risk relative to account size.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'changing risk emotionally',
          'assuming a small percent means no meaningful downside',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'consistent across trades',
          'stable behavior over time',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Risk amount, Position size.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-position-size',
    title: 'Position size',
    summary: 'How big your trade is.',
    content:
      "What this means\n\nHow big your trade is.\n\nWhy it matters\n\nIt controls how much you're exposed.\n\nHow PocketPilot frames it\n\nDerived from your planning inputs, not chosen first.\n\nCommon misunderstanding\n\nChoosing size before defining risk.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nPosition size should be derived from risk and stop-loss context, not confidence or excitement.\n\nHow it behaves\n\nIt changes with stop distance and chosen risk framing.\n\nWhat tends to go wrong\n\nsizing from confidence\n\ninconsistent sizing across similar setups\n\nWhat good looks like\n\nadapts to setup conditions\n\nkeeps risk behavior consistent\n\nWhat it connects to\n\nRisk amount, Stop-loss price, Entry price.",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'How big your trade is.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          "It controls how much you're exposed.",
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'Derived from your planning inputs, not chosen first.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Choosing size before defining risk.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Position size should be derived from risk and stop-loss context, not confidence or excitement.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It changes with stop distance and chosen risk framing.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'sizing from confidence',
          'inconsistent sizing across similar setups',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'adapts to setup conditions',
          'keeps risk behavior consistent',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Risk amount, Stop-loss price, Entry price.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-reward-risk',
    title: 'Reward/risk',
    summary: 'How much you could gain compared to what you could lose.',
    content:
      'What this means\n\nHow much you could gain compared to what you could lose.\n\nWhy it matters\n\nIt helps you judge whether a trade is worth taking.\n\nHow PocketPilot frames it\n\nA comparison tool, not a guarantee.\n\nCommon misunderstanding\n\nAssuming a strong ratio ensures success.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nReward/risk compares potential upside to downside for review. It should support reflection, not force ratios.\n\nHow it behaves\n\nIt is based on entry, stop-loss, and target, and it changes when those inputs change.\n\nWhat tends to go wrong\n\nforcing a ratio without context\n\nignoring strategy fit\n\nWhat good looks like\n\nsupports review decisions\n\naligned with strategy context\n\nWhat it connects to\n\nTarget price, Risk amount.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'How much you could gain compared to what you could lose.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It helps you judge whether a trade is worth taking.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'A comparison tool, not a guarantee.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Assuming a strong ratio ensures success.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Reward/risk compares potential upside to downside for review. It should support reflection, not force ratios.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It is based on entry, stop-loss, and target, and it changes when those inputs change.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'forcing a ratio without context',
          'ignoring strategy fit',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'supports review decisions',
          'aligned with strategy context',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Target price, Risk amount.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-manual-override',
    title: 'Manual override',
    summary: 'Adjust the values yourself.',
    content:
      'What this means\n\nAdjust the values yourself.\n\nWhy it matters\n\nIt keeps you in control of your plan.\n\nHow PocketPilot frames it\n\nThe system supports your decisions, not replaces them.\n\nCommon misunderstanding\n\nThinking it means the system is wrong.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nManual override reinforces user control and deliberate changes.\n\nHow it behaves\n\nIt allows adjustment of planning inputs while keeping prepared context visible.\n\nWhat tends to go wrong\n\nfrequent reactive changes\n\nchanging values without clear reasoning\n\nWhat good looks like\n\ndeliberate, explainable changes\n\nconsistent behavior\n\nWhat it connects to\n\nPrepared planning levels, Risk framing.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Adjust the values yourself.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It keeps you in control of your plan.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'The system supports your decisions, not replaces them.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Thinking it means the system is wrong.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Manual override reinforces user control and deliberate changes.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It allows adjustment of planning inputs while keeping prepared context visible.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'frequent reactive changes',
          'changing values without clear reasoning',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'deliberate, explainable changes',
          'consistent behavior',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Prepared planning levels, Risk framing.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-guardrails',
    title: 'Guardrails',
    summary: 'Optional limits to help manage your risk.',
    content:
      'What this means\n\nOptional limits to help manage your risk.\n\nWhy it matters\n\nThey help you stay within your own rules.\n\nHow PocketPilot frames it\n\nThey flag and highlight, not block or prevent.\n\nCommon misunderstanding\n\nThinking they restrict what you can do.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nGuardrails are planning checks and visibility tools, not silent blockers.\n\nHow it behaves\n\nThey flag and highlight context for review. They do not enforce action.\n\nWhat tends to go wrong\n\nignoring repeated signals\n\nturning them off without intent\n\nWhat good looks like\n\nacknowledged and considered\n\nsupports consistent behavior\n\nWhat it connects to\n\nRisk management, Behavior patterns.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'Optional limits to help manage your risk.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'They help you stay within your own rules.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'They flag and highlight, not block or prevent.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Thinking they restrict what you can do.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Guardrails are planning checks and visibility tools, not silent blockers.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'They flag and highlight context for review. They do not enforce action.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'ignoring repeated signals',
          'turning them off without intent',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'acknowledged and considered',
          'supports consistent behavior',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Risk management, Behavior patterns.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-risk-limit-per-trade',
    title: 'Risk limit per trade',
    summary: "The maximum you're willing to risk on one trade.",
    content:
      "What this means\n\nThe maximum you're willing to risk on one trade.\n\nWhy it matters\n\nIt prevents a single trade from being too large.\n\nHow PocketPilot frames it\n\nFlags when a plan exceeds your chosen level.\n\nCommon misunderstanding\n\nThinking it stops you from acting.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nThis limit helps you see when one plan exceeds your usual single-trade risk.\n\nHow it behaves\n\nIt flags when your plan is above the selected limit. It does not block action.\n\nWhat tends to go wrong\n\nignoring breaches\n\nchanging limits impulsively\n\nWhat good looks like\n\nstable limits\n\ndeliberate exceptions\n\nWhat it connects to\n\nRisk amount, Position size.",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          "The maximum you're willing to risk on one trade.",
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It prevents a single trade from being too large.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'Flags when a plan exceeds your chosen level.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Thinking it stops you from acting.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'This limit helps you see when one plan exceeds your usual single-trade risk.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It flags when your plan is above the selected limit. It does not block action.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'ignoring breaches',
          'changing limits impulsively',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'stable limits',
          'deliberate exceptions',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Risk amount, Position size.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-daily-loss-threshold',
    title: 'Daily loss threshold',
    summary: "A limit for how much you're willing to lose in a day.",
    content:
      "What this means\n\nA limit for how much you're willing to lose in a day.\n\nWhy it matters\n\nIt helps you step back when needed.\n\nHow PocketPilot frames it\n\nA planning boundary, not a prediction.\n\nCommon misunderstanding\n\nThinking it predicts losses.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nDaily loss threshold helps you recognize when enough risk has already been taken for one day.\n\nHow it behaves\n\nIt tracks loss context across the day.\n\nWhat tends to go wrong\n\ncontinuing without pause after threshold pressure appears\n\nWhat good looks like\n\nstepping back when triggered\n\nWhat it connects to\n\nRisk behavior, Trade frequency.",
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          "A limit for how much you're willing to lose in a day.",
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It helps you step back when needed.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'A planning boundary, not a prediction.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Thinking it predicts losses.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Daily loss threshold helps you recognize when enough risk has already been taken for one day.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It tracks loss context across the day.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'continuing without pause after threshold pressure appears',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'stepping back when triggered',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Risk behavior, Trade frequency.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-cooldown-after-loss',
    title: 'Cooldown after loss',
    summary: 'A pause after a loss before trading again.',
    content:
      'What this means\n\nA pause after a loss before trading again.\n\nWhy it matters\n\nIt helps avoid impulsive decisions.\n\nHow PocketPilot frames it\n\nA buffer you choose to apply.\n\nCommon misunderstanding\n\nSeeing it as a punishment.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nCooldown after loss creates space between a loss and the next decision.\n\nHow it behaves\n\nIt introduces a pause before planning again.\n\nWhat tends to go wrong\n\nskipping the pause mentally\n\nWhat good looks like\n\nslower, more deliberate decisions\n\nWhat it connects to\n\nDaily loss threshold, Behavior control.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'A pause after a loss before trading again.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It helps avoid impulsive decisions.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'A buffer you choose to apply.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Seeing it as a punishment.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'Cooldown after loss creates space between a loss and the next decision.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It introduces a pause before planning again.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'skipping the pause mentally',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'slower, more deliberate decisions',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Daily loss threshold, Behavior control.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
  {
    topicId: 'trade-hub-confirmation-shell-and-non-dispatch-boundary',
    title: 'Confirmation shell / non-dispatch boundary',
    summary: 'A final check before you act.',
    content:
      'What this means\n\nA final check before you act.\n\nWhy it matters\n\nIt separates planning from execution.\n\nHow PocketPilot frames it\n\nPocketPilot supports decisions but does not place trades.\n\nCommon misunderstanding\n\nAssuming the system executes trades automatically.\n\nLayer 2: Deeper thinking\n\nThis layer adds optional deeper planning context beneath the beginner foundation.\n\nHow to think about it\n\nThis boundary separates planning from action.\n\nHow it behaves\n\nIt presents your plan for acknowledgement before handoff. PocketPilot does not place trades.\n\nWhat tends to go wrong\n\nskipping the review step\n\ntreating confirmation as a formality\n\nWhat good looks like\n\ndeliberate confirmation\n\nclear understanding of the plan\n\nWhat it connects to\n\nExecution readiness, User control.',
    mediaType: 'ARTICLE',
    difficulty: 'BEGINNER',
    strategyLinks: [],
    signalLinks: [],
    eventTypeLinks: [],
    family: 'action-risk',
    priority: 'NOW',
    sections: [
      {
        heading: 'What this means',
        body: [
          'A final check before you act.',
        ],
      },
      {
        heading: 'Why it matters',
        body: [
          'It separates planning from execution.',
        ],
      },
      {
        heading: 'How PocketPilot frames it',
        body: [
          'PocketPilot supports decisions but does not place trades.',
        ],
      },
      {
        heading: 'Common misunderstanding',
        body: [
          'Assuming the system executes trades automatically.',
        ],
      },
      {
        heading: 'Layer 2: Deeper thinking',
        body: [
          'This layer adds optional deeper planning context beneath the beginner foundation.',
        ],
      },
      {
        heading: 'How to think about it',
        body: [
          'This boundary separates planning from action.',
        ],
      },
      {
        heading: 'How it behaves',
        body: [
          'It presents your plan for acknowledgement before handoff. PocketPilot does not place trades.',
        ],
      },
      {
        heading: 'What tends to go wrong',
        body: [
          'skipping the review step',
          'treating confirmation as a formality',
        ],
      },
      {
        heading: 'What good looks like',
        body: [
          'deliberate confirmation',
          'clear understanding of the plan',
        ],
      },
      {
        heading: 'What it connects to',
        body: [
          'Execution readiness, User control.',
        ],
      },
    ],
    relatedTopicIds: [],
  },
] satisfies ReadonlyArray<KnowledgeCatalogEntry>;
