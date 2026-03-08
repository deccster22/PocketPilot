export type AppMode = 'demo' | 'mock' | 'live';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type QuoteProvider = 'demo' | 'coingecko' | 'cryptocompare';

export type AppConfig = {
  APP_MODE: AppMode;
  ENABLE_DEBUG_PANEL: boolean;
  LOG_LEVEL: LogLevel;
  QUOTE_PROVIDER: QuoteProvider;
};

const APP_MODE_VALUES: AppMode[] = ['demo', 'mock', 'live'];
const LOG_LEVEL_VALUES: LogLevel[] = ['debug', 'info', 'warn', 'error'];
const QUOTE_PROVIDER_VALUES: QuoteProvider[] = ['demo', 'coingecko', 'cryptocompare'];

const DEFAULT_CONFIG: AppConfig = {
  APP_MODE: 'demo',
  ENABLE_DEBUG_PANEL: process.env.NODE_ENV !== 'production',
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  QUOTE_PROVIDER: 'demo',
};

function parseEnum<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
  fallback: T,
): T {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  return (allowedValues.find((entry) => entry === normalized) ?? fallback) as T;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

export const Config: AppConfig = {
  APP_MODE: parseEnum(process.env.APP_MODE, APP_MODE_VALUES, DEFAULT_CONFIG.APP_MODE),
  ENABLE_DEBUG_PANEL: parseBoolean(process.env.ENABLE_DEBUG_PANEL, DEFAULT_CONFIG.ENABLE_DEBUG_PANEL),
  LOG_LEVEL: parseEnum(process.env.LOG_LEVEL, LOG_LEVEL_VALUES, DEFAULT_CONFIG.LOG_LEVEL),
  QUOTE_PROVIDER: parseEnum(
    process.env.QUOTE_PROVIDER,
    QUOTE_PROVIDER_VALUES,
    DEFAULT_CONFIG.QUOTE_PROVIDER,
  ),
};
