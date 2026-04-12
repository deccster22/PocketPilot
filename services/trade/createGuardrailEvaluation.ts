import type {
  GuardrailEvaluationAvailability,
  GuardrailEvaluationItem,
  GuardrailEvaluationStatus,
  GuardrailKey,
  GuardrailPreferencesAvailability,
  PreparedTradeRiskLane,
  ProtectionPlan,
  RiskPerTradeContext,
} from '@/services/trade/types';

const ENABLED_GUARDRAIL_ORDER: ReadonlyArray<GuardrailKey> = [
  'riskLimitPerTrade',
  'dailyLossThreshold',
  'cooldownAfterLoss',
];

type ParsedComparableValue = {
  kind: 'PERCENT' | 'CURRENCY';
  value: number;
};

type AvailableRiskContext = Omit<RiskPerTradeContext, 'status'> & {
  status: 'AVAILABLE';
};

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseComparableValue(value: string | null | undefined): ParsedComparableValue | null {
  const trimmedValue = normaliseOptionalText(value);

  if (trimmedValue === null) {
    return null;
  }

  const percentMatch = /^(-?\d[\d,]*(?:\.\d+)?)\s*%$/.exec(trimmedValue);

  if (percentMatch) {
    const numericValue = Number(percentMatch[1].replace(/,/g, ''));

    return Number.isFinite(numericValue)
      ? {
          kind: 'PERCENT',
          value: numericValue,
        }
      : null;
  }

  const currencyMatch = /^\s*[^0-9%]*(-?\d[\d,]*(?:\.\d+)?)\s*$/.exec(trimmedValue);

  if (!currencyMatch) {
    return null;
  }

  const numericValue = Number(currencyMatch[1].replace(/,/g, ''));

  return Number.isFinite(numericValue)
    ? {
        kind: 'CURRENCY',
        value: numericValue,
      }
    : null;
}

function classifyComparableValue(currentValue: number, thresholdValue: number): GuardrailEvaluationStatus {
  if (!Number.isFinite(currentValue) || !Number.isFinite(thresholdValue) || thresholdValue <= 0) {
    return 'NOT_EVALUATED';
  }

  if (currentValue > thresholdValue) {
    return 'OUTSIDE_GUARDRAIL';
  }

  if (currentValue >= thresholdValue * 0.9) {
    return 'NEAR_GUARDRAIL';
  }

  return 'WITHIN_GUARDRAIL';
}

function convertComparableValueToCurrency(
  comparableValue: ParsedComparableValue,
  accountValue: number | null,
): number | null {
  if (comparableValue.kind === 'CURRENCY') {
    return comparableValue.value;
  }

  if (accountValue === null || !Number.isFinite(accountValue) || accountValue <= 0) {
    return null;
  }

  return (comparableValue.value / 100) * accountValue;
}

function compareComparableValues(params: {
  currentValue: ParsedComparableValue;
  thresholdValue: ParsedComparableValue;
  accountValue: number | null;
}): GuardrailEvaluationStatus | null {
  if (params.currentValue.kind === params.thresholdValue.kind) {
    return classifyComparableValue(params.currentValue.value, params.thresholdValue.value);
  }

  if (params.currentValue.kind === 'PERCENT' && params.thresholdValue.kind === 'CURRENCY') {
    const currentCurrencyValue = convertComparableValueToCurrency(
      params.currentValue,
      params.accountValue,
    );

    return currentCurrencyValue === null
      ? null
      : classifyComparableValue(currentCurrencyValue, params.thresholdValue.value);
  }

  if (params.currentValue.kind === 'CURRENCY' && params.thresholdValue.kind === 'PERCENT') {
    const thresholdCurrencyValue = convertComparableValueToCurrency(
      params.thresholdValue,
      params.accountValue,
    );

    return thresholdCurrencyValue === null
      ? null
      : classifyComparableValue(params.currentValue.value, thresholdCurrencyValue);
  }

  return null;
}

function findRiskContextItemValue(
  riskContext: AvailableRiskContext,
  label: string,
): string | null {
  return riskContext.items.find((item) => item.label === label)?.value ?? null;
}

function isAvailableRiskContext(
  context: PreparedTradeRiskLane['context'],
): context is AvailableRiskContext {
  return context !== null && context.status === 'AVAILABLE';
}

function createCalmItemSummary(params: {
  status: GuardrailEvaluationStatus;
  withinText: string;
  nearText?: string;
  outsideText: string;
  notEvaluatedText: string;
}): string {
  switch (params.status) {
    case 'NEAR_GUARDRAIL':
      return params.nearText ?? params.withinText;
    case 'OUTSIDE_GUARDRAIL':
      return params.outsideText;
    case 'WITHIN_GUARDRAIL':
      return params.withinText;
    default:
      return params.notEvaluatedText;
  }
}

function createComparableGuardrailItem(params: {
  guardrailKey: GuardrailKey;
  label: string;
  currentValueLabel: string | null;
  thresholdLabel: string | null;
  accountValue: number | null;
  withinText: string;
  nearText?: string;
  outsideText: string;
  notEvaluatedText: string;
}): GuardrailEvaluationItem {
  const currentValue = parseComparableValue(params.currentValueLabel);
  const thresholdValue = parseComparableValue(params.thresholdLabel);

  if (currentValue === null || thresholdValue === null) {
    return {
      guardrailKey: params.guardrailKey,
      status: 'NOT_EVALUATED',
      label: params.label,
      summary: params.notEvaluatedText,
    };
  }

  const status = compareComparableValues({
    currentValue,
    thresholdValue,
    accountValue: params.accountValue,
  });

  if (status === null) {
    return {
      guardrailKey: params.guardrailKey,
      status: 'NOT_EVALUATED',
      label: params.label,
      summary: params.notEvaluatedText,
    };
  }

  return {
    guardrailKey: params.guardrailKey,
    status,
    label: params.label,
    summary: createCalmItemSummary({
      status,
      withinText: params.withinText,
      nearText: params.nearText,
      outsideText: params.outsideText,
      notEvaluatedText: params.notEvaluatedText,
    }),
  };
}

function createCooldownGuardrailItem(params: {
  cooldownActive?: boolean;
}): GuardrailEvaluationItem {
  if (params.cooldownActive === undefined) {
    return {
      guardrailKey: 'cooldownAfterLoss',
      status: 'NOT_EVALUATED',
      label: 'Cooldown after loss',
      summary: 'The current plan does not yet carry a cooldown state.',
    };
  }

  return {
    guardrailKey: 'cooldownAfterLoss',
    status: params.cooldownActive ? 'OUTSIDE_GUARDRAIL' : 'WITHIN_GUARDRAIL',
    label: 'Cooldown after loss',
    summary: params.cooldownActive
      ? 'A cooldown window is active after a loss.'
      : 'No cooldown is active right now.',
  };
}

function createEvaluationSummary(items: ReadonlyArray<GuardrailEvaluationItem>): string {
  const outsideCount = items.filter((item) => item.status === 'OUTSIDE_GUARDRAIL').length;
  const nearCount = items.filter((item) => item.status === 'NEAR_GUARDRAIL').length;
  const withinCount = items.filter((item) => item.status === 'WITHIN_GUARDRAIL').length;
  const notEvaluatedCount = items.filter((item) => item.status === 'NOT_EVALUATED').length;

  if (outsideCount > 0) {
    const outsideText =
      outsideCount === 1 ? 'One enabled guardrail sits outside the chosen structure.' : `${outsideCount} enabled guardrails sit outside the chosen structure.`;

    return notEvaluatedCount > 0
      ? `${outsideText} Trade Hub prepared the rest as not evaluated, and is only describing that status here.`
      : `${outsideText} Trade Hub is only describing that status here.`;
  }

  if (nearCount > 0) {
    const nearText =
      nearCount === 1 ? 'One enabled guardrail sits near the chosen structure.' : `${nearCount} enabled guardrails sit near the chosen structure.`;

    return notEvaluatedCount > 0
      ? `${nearText} Trade Hub prepared the rest as not evaluated, and is only describing that status here.`
      : `${nearText} Trade Hub is only describing that status here.`;
  }

  if (withinCount > 0) {
    return notEvaluatedCount > 0
      ? 'Trade Hub prepared the enabled guardrails it could compare, and left the rest as not evaluated.'
      : 'The selected plan sits within the enabled guardrails.';
  }

  return 'The current guardrails could not be compared with the selected plan yet.';
}

function createUnavailableGuardrailEvaluationAvailability(
  reason: 'NO_ENABLED_GUARDRAILS' | 'INSUFFICIENT_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE',
): GuardrailEvaluationAvailability {
  return {
    status: 'UNAVAILABLE',
    reason,
  };
}

function createRiskLimitPerTradeItem(params: {
  riskContext: AvailableRiskContext | null;
  preferencesThresholdLabel: string | null;
  accountValue: number | null;
}): GuardrailEvaluationItem {
  const currentValueLabel = params.riskContext
    ? findRiskContextItemValue(params.riskContext, 'Risk per trade')
    : null;

  return createComparableGuardrailItem({
    guardrailKey: 'riskLimitPerTrade',
    label: 'Risk limit per trade',
    currentValueLabel,
    thresholdLabel: params.preferencesThresholdLabel,
    accountValue: params.accountValue,
    withinText: 'Current risk per trade stays within your saved threshold.',
    nearText: 'Current risk per trade sits close to your saved threshold.',
    outsideText: 'Current risk per trade sits above your saved threshold.',
    notEvaluatedText: 'Current risk per trade could not be compared with the current plan.',
  });
}

function createDailyLossThresholdItem(params: {
  riskContext: AvailableRiskContext | null;
  preferencesThresholdLabel: string | null;
  accountValue: number | null;
}): GuardrailEvaluationItem {
  const currentValueLabel = params.riskContext
    ? findRiskContextItemValue(params.riskContext, 'Max loss at cap')
    : null;

  return createComparableGuardrailItem({
    guardrailKey: 'dailyLossThreshold',
    label: 'Daily loss threshold',
    currentValueLabel,
    thresholdLabel: params.preferencesThresholdLabel,
    accountValue: params.accountValue,
    withinText: 'Current max loss at cap stays within your saved threshold.',
    nearText: 'Current max loss at cap sits close to your saved threshold.',
    outsideText: 'Current max loss at cap sits above your saved threshold.',
    notEvaluatedText: 'Current max loss at cap could not be compared with the current plan.',
  });
}

export function createGuardrailEvaluation(params: {
  plan: ProtectionPlan | null;
  risk: PreparedTradeRiskLane;
  guardrailPreferencesAvailability: GuardrailPreferencesAvailability;
  accountValue?: number | null;
  isEnabledForSurface: boolean;
}): GuardrailEvaluationAvailability {
  if (!params.isEnabledForSurface) {
    return createUnavailableGuardrailEvaluationAvailability('NOT_ENABLED_FOR_SURFACE');
  }

  if (params.guardrailPreferencesAvailability.status === 'UNAVAILABLE') {
    if (params.guardrailPreferencesAvailability.reason === 'NOT_ENABLED_FOR_SURFACE') {
      return createUnavailableGuardrailEvaluationAvailability('NOT_ENABLED_FOR_SURFACE');
    }

    return createUnavailableGuardrailEvaluationAvailability('INSUFFICIENT_CONTEXT');
  }

  const preferences = params.guardrailPreferencesAvailability.preferences;
  const enabledGuardrailKeys = ENABLED_GUARDRAIL_ORDER.filter((guardrailKey) => {
    switch (guardrailKey) {
      case 'riskLimitPerTrade':
        return preferences.riskLimitPerTrade.isEnabled;
      case 'dailyLossThreshold':
        return preferences.dailyLossThreshold.isEnabled;
      default:
        return preferences.cooldownAfterLoss.isEnabled;
    }
  });

  if (enabledGuardrailKeys.length === 0) {
    return createUnavailableGuardrailEvaluationAvailability('NO_ENABLED_GUARDRAILS');
  }

  const availableRiskContext = isAvailableRiskContext(params.risk.context)
    ? params.risk.context
    : null;

  if (params.plan === null) {
    return createUnavailableGuardrailEvaluationAvailability('INSUFFICIENT_CONTEXT');
  }

  const selectedPlan = params.plan;

  const items = enabledGuardrailKeys.map((guardrailKey): GuardrailEvaluationItem => {
    switch (guardrailKey) {
      case 'riskLimitPerTrade':
        return createRiskLimitPerTradeItem({
          riskContext: availableRiskContext,
          preferencesThresholdLabel: preferences.riskLimitPerTrade.thresholdLabel,
          accountValue: params.accountValue ?? null,
        });
      case 'dailyLossThreshold':
        return createDailyLossThresholdItem({
          riskContext: availableRiskContext,
          preferencesThresholdLabel: preferences.dailyLossThreshold.thresholdLabel,
          accountValue: params.accountValue ?? null,
        });
      default:
        return createCooldownGuardrailItem({
          cooldownActive: selectedPlan.constraints.cooldownActive,
        });
    }
  });

  const evaluatedItems = items.filter((item) => item.status !== 'NOT_EVALUATED');

  if (evaluatedItems.length === 0) {
    return createUnavailableGuardrailEvaluationAvailability('INSUFFICIENT_CONTEXT');
  }

  return {
    status: 'AVAILABLE',
    evaluation: {
      title: 'Prepared guardrail status',
      summary: createEvaluationSummary(items),
      items,
    },
  };
}
