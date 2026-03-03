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
    expect(() => selectExecutionAccount([])).toThrow('No accounts available');
  });

  it('handles equal portfolio values deterministically (first highest wins)', () => {
    const accounts: Account[] = [
      { id: 'acct-1', portfolioValue: 10_000 },
      { id: 'acct-2', portfolioValue: 10_000 },
      { id: 'acct-3', portfolioValue: 9_500 },
    ];

    expect(selectExecutionAccount(accounts)).toBe('acct-1');
  });
});
