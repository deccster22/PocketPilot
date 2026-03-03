export type Account = {
  id: string;
  portfolioValue: number;
  isPrimary?: boolean;
};

export function selectExecutionAccount(accounts: Account[]): string {
  if (accounts.length === 0) {
    throw new Error('No accounts available');
  }

  const primaryAccounts = accounts.filter((account) => account.isPrimary === true);

  if (primaryAccounts.length === 1) {
    return primaryAccounts[0].id;
  }

  return accounts.reduce((selected, current) => {
    if (current.portfolioValue > selected.portfolioValue) {
      return current;
    }

    return selected;
  }).id;
}
