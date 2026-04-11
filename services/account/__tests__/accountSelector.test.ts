import { selectExecutionAccount, type Account } from '@/services/account/accountSelector';

describe('selectExecutionAccount', () => {
  it('returns primary when present', () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 4_000 },
      { id: 'acct-2', portfolioValue: 3_000, isPrimary: true },
    ];

    expect(selectExecutionAccount(accounts)).toBe('acct-2');
  });

  it('ignores portfolio value if primary exists', () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 12_000 },
      { id: 'acct-2', portfolioValue: 2_000, isPrimary: true },
    ];

    expect(selectExecutionAccount(accounts)).toBe('acct-2');
  });

  it('returns highest portfolio when no primary', () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 2_000 },
      { id: 'acct-2', portfolioValue: 9_000 },
      { id: 'acct-3', portfolioValue: 7_000 },
    ];

    expect(selectExecutionAccount(accounts)).toBe('acct-2');
  });

  it('throws error when no accounts are available', () => {
    expect(() => selectExecutionAccount([])).toThrow(
      'Selected account context is unavailable: NO_ACCOUNTS_AVAILABLE.',
    );
  });

  it('handles equal portfolio values deterministically by account id', () => {
    const accounts: Account[] = [
      { id: 'acct-2', portfolioValue: 10_000 },
      { id: 'acct-1', portfolioValue: 10_000 },
      { id: 'acct-3', portfolioValue: 9_500 },
    ];

    expect(selectExecutionAccount(accounts)).toBe('acct-1');
  });

  it('honours an explicit account selection when provided', () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 10_000, isPrimary: true },
      { id: 'acct-2', portfolioValue: 2_500 },
    ];

    expect(selectExecutionAccount(accounts, 'acct-2')).toBe('acct-2');
  });
});
