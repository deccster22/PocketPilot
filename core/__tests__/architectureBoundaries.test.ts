import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const listTypeScriptFiles = (dir: string): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        return [];
      }

      return listTypeScriptFiles(fullPath);
    }

    if (entry.isFile() && fullPath.endsWith('.ts')) {
      return [fullPath];
    }

    return [];
  });
};

describe('core architecture boundaries', () => {
  it('prevents imports from providers or app inside core', () => {
    const coreFiles = listTypeScriptFiles(join(process.cwd(), 'core'));
    const offenders: string[] = [];

    coreFiles.forEach((file) => {
      const content = readFileSync(file, 'utf8');
      const forbiddenImport =
        /from\s+['\"](?:@\/providers|@\/app|\.\.\/providers|\.\.\/app|providers\/|app\/)/;

      if (forbiddenImport.test(content)) {
        offenders.push(file.replace(`${process.cwd()}/`, ''));
      }
    });

    expect(offenders).toEqual([]);
  });
});
