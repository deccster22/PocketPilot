export const TRADE_HUB_SAFETY_TEXT =
  'Trade Hub frames possible actions only. Nothing here executes a trade.';

export function createTradeHubConfirmationText(requiresConfirmation: boolean): string {
  return requiresConfirmation
    ? 'Every action remains confirmation-safe and non-executing in this phase.'
    : 'Confirmation rules are not required.';
}
