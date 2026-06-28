#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const result = spawnSync(
  'npx',
  ['esbuild', 'web/js/app.js', '--bundle', '--format=iife', '--outfile=web/bundle.js', '--platform=browser'],
  { cwd: ROOT, stdio: 'inherit', shell: true },
);
process.exit(result.status ?? 1);