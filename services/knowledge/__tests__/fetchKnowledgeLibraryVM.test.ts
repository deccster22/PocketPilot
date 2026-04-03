import { fetchKnowledgeLibraryVM } from '@/services/knowledge/fetchKnowledgeLibraryVM';

describe('fetchKnowledgeLibraryVM', () => {
  it('returns one canonical library VM for the Knowledge Library surface', () => {
    const result = fetchKnowledgeLibraryVM();

    expect(result).toMatchObject({
      title: 'Knowledge Library',
      summary:
        'A quiet reference shelf for how PocketPilot frames strategy, market events, and calm discipline.',
      availability: {
        status: 'AVAILABLE',
      },
    });

    if (result.availability.status !== 'AVAILABLE') {
      throw new Error('Expected knowledge library to be available.');
    }

    expect(result.availability.sections.map((section) => section.title)).toEqual([
      'Getting Started',
      'Strategy Basics',
      'Event Interpretation',
      'Risk and Discipline',
    ]);
  });

  it('returns unavailable instead of gating other surfaces when the library is not enabled there', () => {
    expect(fetchKnowledgeLibraryVM({ surface: 'DASHBOARD' })).toEqual({
      title: 'Knowledge Library',
      summary:
        'A quiet reference shelf for how PocketPilot frames strategy, market events, and calm discipline.',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });

  it('returns unavailable when no knowledge baseline exists', () => {
    expect(
      fetchKnowledgeLibraryVM({
        surface: 'KNOWLEDGE_LIBRARY',
        nodes: [],
      }),
    ).toEqual({
      title: 'Knowledge Library',
      summary:
        'A quiet reference shelf for how PocketPilot frames strategy, market events, and calm discipline.',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_KNOWLEDGE_BASELINE',
      },
    });
  });

  it('remains deterministic for identical inputs', () => {
    const params = {
      surface: 'KNOWLEDGE_LIBRARY' as const,
    };

    expect(fetchKnowledgeLibraryVM(params)).toEqual(fetchKnowledgeLibraryVM(params));
  });
});
