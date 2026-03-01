import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const requiredPaths = [
  'package.json',
  'app',
  'core',
  'providers'
];

for (const requiredPath of requiredPaths) {
  assert.equal(existsSync(requiredPath), true, `Missing required path: ${requiredPath}`);
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
assert.equal(typeof packageJson.name, 'string');
