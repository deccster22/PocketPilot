const KEY_LIKE_PATTERN = /(?:\bsk-[a-z0-9_-]{12,}\b)|(?:\b(?:api[_-]?key|token|secret|authorization)\s*[:=]\s*["']?[a-z0-9+/=_\-.]{16,}["']?\b)/gi;

const REDACTED_VALUE = '[REDACTED]';

function redactString(value: string): string {
  return value.replace(KEY_LIKE_PATTERN, REDACTED_VALUE);
}

const SENSITIVE_KEYS = new Set([
  'key',
  'token',
  'secret',
  'authorization',
  'apikey',
  'x-api-key',
]);

export function redact(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactString(value);
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  const asRecord = value as Record<string, unknown>;
  const redacted: Record<string, unknown> = {};

  Object.entries(asRecord).forEach(([key, entry]) => {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      redacted[key] = REDACTED_VALUE;
      return;
    }

    redacted[key] = typeof entry === 'string' ? redactString(entry) : entry;
  });

  return redacted;
}
