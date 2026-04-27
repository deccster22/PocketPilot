import {
  createPreparedReferenceCopy,
  createPreparedReferenceUnavailableCopy,
  resolvePreparedReferenceSourceFromLabel,
} from '@/services/trade/createPreparedReferenceCopy';

describe('createPreparedReferenceCopy', () => {
  it('builds canonical strategy-context copy with calm limitations', () => {
    expect(
      createPreparedReferenceCopy({
        kind: 'STOP',
        source: 'STRATEGY_CONTEXT',
      }),
    ).toEqual({
      label: 'Prepared stop-loss level',
      sourceLabel: 'Source: supported strategy context',
      limitations: [
        'Optional planning context from the selected plan. Your own values remain authoritative.',
        'Derived from supported strategy context and omitted when context is thin.',
      ],
    });
  });

  it('builds canonical prepared-plan copy with the same support-first planning posture', () => {
    expect(
      createPreparedReferenceCopy({
        kind: 'TARGET',
        source: 'PREPARED_PLAN',
      }),
    ).toEqual({
      label: 'Prepared target level',
      sourceLabel: 'Source: prepared plan context',
      limitations: ['Optional planning context from the selected plan. Your own values remain authoritative.'],
    });
  });

  it('keeps unavailable copy explicit and deterministic for each unavailable reason', () => {
    expect(createPreparedReferenceUnavailableCopy('NO_STRATEGY_REFERENCE')).toBe(
      'This setup does not publish prepared stop-loss or target levels.',
    );
    expect(createPreparedReferenceUnavailableCopy('THIN_CONTEXT')).toBe(
      'This setup does not provide enough context for prepared stop-loss or target levels yet.',
    );
    expect(createPreparedReferenceUnavailableCopy('NOT_ENABLED_FOR_SURFACE')).toBe(
      'Prepared stop-loss or target levels are not shown on this surface.',
    );
  });

  it('does not use recommendation, certainty, or profit language in prepared reference copy', () => {
    const strategyCopy = createPreparedReferenceCopy({
      kind: 'STOP',
      source: 'STRATEGY_CONTEXT',
    });
    const preparedCopy = createPreparedReferenceCopy({
      kind: 'TARGET',
      source: 'PREPARED_PLAN',
    });
    const unavailableCopy = [
      createPreparedReferenceUnavailableCopy('NO_STRATEGY_REFERENCE'),
      createPreparedReferenceUnavailableCopy('THIN_CONTEXT'),
      createPreparedReferenceUnavailableCopy('NOT_ENABLED_FOR_SURFACE'),
    ];
    const copyText = `${JSON.stringify(strategyCopy)} ${JSON.stringify(preparedCopy)} ${JSON.stringify(unavailableCopy)}`;

    expect(copyText).not.toMatch(
      /\brecommended|safe|guaranteed|optimal|predict|expected profit|profit opportunity|certainty\b/i,
    );
  });

  it('maps legacy source labels to canonical source kinds for normalization', () => {
    expect(resolvePreparedReferenceSourceFromLabel('Source: prepared plan')).toBe('PREPARED_PLAN');
    expect(resolvePreparedReferenceSourceFromLabel('Source: strategy context')).toBe(
      'STRATEGY_CONTEXT',
    );
  });
});
