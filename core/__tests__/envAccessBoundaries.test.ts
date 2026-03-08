import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE_DIRS = ['app', 'core', 'providers', 'services'];
const ALLOWLIST = new Set(['core/config/Config.ts']);

const listSourceFiles = (dir: string): string[] => {
  const entries = readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        return [];
      }

      return listSourceFiles(fullPath);
    }

    if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      return [fullPath];
    }

    return [];
  });
};

const norm = (p: string) => p.replace(/\\/g, "/");

const isAllowedEnvFile = (relativePath: string) => {
  const p = norm(relativePath);
  return p.startsWith("core/config/") || p.includes("/core/config/"); // belt + suspenders
};

describe('env access boundaries', () => {
  it('disallows direct process.env reads outside config module', () => {
    const offenders: string[] = [];

    SOURCE_DIRS.forEach((sourceDir) => {
      const files = listSourceFiles(join(process.cwd(), sourceDir));

      files.forEach((file) => {
        const relativePath = norm(file).replace(norm(process.cwd()) + "/","");

        if (isAllowedEnvFile(relativePath) || (typeof ALLOWLIST !== "undefined" && ALLOWLIST.has(relativePath))) {
  		return;
	}

        const content = readFileSync(file, 'utf8');

        if (/process\.env/.test(content)) {
          offenders.push(relativePath);
        }
      });
    });

    expect(offenders).toEqual([]);
  });
});
