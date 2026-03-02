import { certaintyText } from '@/app/utils/certaintyText';

describe('certaintyText', () => {
  const labels = {
    confirmed: 'Confirmed fill.',
    estimated: 'Estimated fill.',
  };

  it('uses estimated language when estimated is true', () => {
    expect(certaintyText({ estimated: true }, labels)).toBe('Estimated fill.');
  });

  it('uses confirmed language when estimated is false', () => {
    expect(certaintyText({ estimated: false }, labels)).toBe('Confirmed fill.');
  });
});
