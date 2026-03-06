import { redact } from '@/core/config/redact';

describe('redact', () => {
  it('redacts key-like strings', () => {
    expect(redact('Authorization: Bearer sk-abc123456789def')).toBe('Authorization: Bearer [REDACTED]');
  });

  it('redacts shallow sensitive fields in objects', () => {
    expect(
      redact({
        apiKey: 'abc123456789012345',
        x: 'keep-me',
        nested: { token: 'this-is-not-deep-redacted' },
      }),
    ).toEqual({
      apiKey: '[REDACTED]',
      x: 'keep-me',
      nested: { token: 'this-is-not-deep-redacted' },
    });
  });
});
