#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SCRATCH = process.env.SCRATCH || '/var/folders/h5/777kg7xs0d3345cjkktl8qxc0000gn/T/grok-goal-5c88c7a4a5ac/implementer';
const ROOT = join(import.meta.dirname, '..');
mkdirSync(SCRATCH, { recursive: true });

const css = readFileSync(join(ROOT, 'web/styles.css'), 'utf8');
const html = readFileSync(join(ROOT, 'web/index.html'), 'utf8');
const app = readFileSync(join(ROOT, 'web/js/app.js'), 'utf8');

const checks = [
  ['dark theme tokens', /--bg: #0a0e14/.test(css) && /--indigo/.test(css)],
  ['reduced motion', /prefers-reduced-motion/.test(css)],
  ['ARIA labels', /aria-label/.test(html) && /aria-label/.test(app)],
  ['keyboard handlers', /keydown/.test(app)],
  ['sidebar collapse', /sidebar-toggle/.test(html) && /sidebarCollapsed/.test(app)],
  ['toast feedback', /showToast/.test(app) && /toast-container/.test(css)],
  ['escape html utility', /escapeHtml/.test(app)],
  ['localStorage progress', /localStorage/.test(readFileSync(join(ROOT, 'web/js/core/progress.js'), 'utf8'))],
  ['no fetch in core simulators', !readFileSync(join(ROOT, 'web/js/core/react-simulator.js'), 'utf8').includes('fetch(')],
  ['9 modules', readFileSync(join(ROOT, 'web/js/data/curriculum.js'), 'utf8').includes('id: 9')],
  ['3 capstones', readFileSync(join(ROOT, 'web/js/data/curriculum.js'), 'utf8').includes('research-agent')],
  ['node types', readFileSync(join(ROOT, 'web/js/data/curriculum.js'), 'utf8').includes("'Router'")],
  ['edge labels in render', /e\.label/.test(readFileSync(join(ROOT, 'web/js/core/sketch-render.js'), 'utf8'))],
  ['stricter checkpoints', /MIN_KEYWORDS/.test(readFileSync(join(ROOT, 'web/js/core/checkpoints.js'), 'utf8'))],
  ['hybrid rag mode', /hybrid/.test(readFileSync(join(ROOT, 'web/js/core/rag-simulator.js'), 'utf8'))],
];

const lines = checks.map(([name, ok]) => `${ok ? 'PASS' : 'FAIL'}: ${name}`);
const failed = checks.filter(([, ok]) => !ok);
writeFileSync(join(SCRATCH, 'static-inspection.txt'), lines.join('\n'));
if (failed.length) {
  console.error(lines.join('\n'));
  process.exit(1);
}
console.log(lines.join('\n'));