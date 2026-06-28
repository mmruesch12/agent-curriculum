#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SCRATCH = process.env.SCRATCH || '/var/folders/h5/777kg7xs0d3345cjkktl8qxc0000gn/T/grok-goal-8af6a0b5e05f/implementer';
const ROOT = join(import.meta.dirname, '..');
mkdirSync(SCRATCH, { recursive: true });

const css = readFileSync(join(ROOT, 'web/styles.css'), 'utf8');
const html = readFileSync(join(ROOT, 'web/index.html'), 'utf8');
const app = readFileSync(join(ROOT, 'web/js/app.js'), 'utf8');

const checks = [
  ['dark theme tokens', /--bg: #0f1419/.test(css) && /--indigo/.test(css)],
  ['reduced motion', /prefers-reduced-motion/.test(css)],
  ['ARIA labels', /aria-label/.test(html) && /aria-label/.test(app)],
  ['keyboard handlers', /keydown/.test(app)],
  ['localStorage progress', /localStorage/.test(readFileSync(join(ROOT, 'web/js/core/progress.js'), 'utf8'))],
  ['no fetch in core simulators', !readFileSync(join(ROOT, 'web/js/core/react-simulator.js'), 'utf8').includes('fetch(')],
  ['9 modules', (app.match(/id: \d/g) || []).length >= 9 || readFileSync(join(ROOT, 'web/js/data/curriculum.js'), 'utf8').includes('id: 9')],
  ['3 capstones', readFileSync(join(ROOT, 'web/js/data/curriculum.js'), 'utf8').includes('research-agent')],
  ['node types', readFileSync(join(ROOT, 'web/js/data/curriculum.js'), 'utf8').includes("'Router'")],
];

const lines = checks.map(([name, ok]) => `${ok ? 'PASS' : 'FAIL'}: ${name}`);
const failed = checks.filter(([, ok]) => !ok);
writeFileSync(join(SCRATCH, 'static-inspection.txt'), lines.join('\n'));
if (failed.length) {
  console.error(lines.join('\n'));
  process.exit(1);
}
console.log(lines.join('\n'));