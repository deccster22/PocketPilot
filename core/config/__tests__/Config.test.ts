describe('Config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it('falls back to demo-safe defaults when env vars are missing', async () => {
    delete process.env.APP_MODE;
    delete process.env.ENABLE_DEBUG_PANEL;
    delete process.env.LOG_LEVEL;
    delete process.env.QUOTE_PROVIDER;

    const { Config } = await import('@/core/config/Config');

    expect(Config.APP_MODE).toBe('demo');
    expect(Config.QUOTE_PROVIDER).toBe('demo');
    expect(['debug', 'warn']).toContain(Config.LOG_LEVEL);
    expect(typeof Config.ENABLE_DEBUG_PANEL).toBe('boolean');
  });

  it('parses valid env values', async () => {
    process.env.APP_MODE = 'live';
    process.env.ENABLE_DEBUG_PANEL = 'false';
    process.env.LOG_LEVEL = 'error';
    process.env.QUOTE_PROVIDER = 'cryptocompare';

    const { Config } = await import('@/core/config/Config');

    expect(Config).toEqual({
      APP_MODE: 'live',
      ENABLE_DEBUG_PANEL: false,
      LOG_LEVEL: 'error',
      QUOTE_PROVIDER: 'cryptocompare',
    });
  });
});
