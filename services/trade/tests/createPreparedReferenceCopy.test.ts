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
      label: 'Prepared stop reference',
      sourceLabel: 'Source: supported strategy context',
      limitations: [
        'Planning context only; this is not an order instruction.',
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
      label: 'Prepared target reference',
      sourceLabel: 'Source: prepared plan context',
      limitations: ['Planning context only; this is not an order instruction.'],
    });
  });

  it('keeps unavailable copy explicit and deterministic for each unavailable reason', () => {
    expect(createPreparedReferenceUnavailableCopy('NO_STRATEGY_REFERENCE')).toBe(
      'Unavailable because this context does not publish prepared stop/target references.',
    );
    expect(createPreparedReferenceUnavailableCopy('THIN_CONTEXT')).toBe(
      'Unavailable because prepared stop/target context is thin or ambiguous.',
    );
    expect(createPreparedReferenceUnavailableCopy('NOT_ENABLED_FOR_SURFACE')).toBe(
      'Unavailable because this surface does not publish prepared stop/target references.',
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
