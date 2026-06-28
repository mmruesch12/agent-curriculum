#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRATCH = process.env.SCRATCH || '/var/folders/h5/777kg7xs0d3345cjkktl8qxc0000gn/T/grok-goal-8af6a0b5e05f/implementer';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3456;
const URL = `http://127.0.0.1:${PORT}`;

mkdirSync(SCRATCH, { recursive: true });

const TRADEOFFS = [
  'Latency vs quality: reflection adds tokens',
  'Cost vs control: more HITL gates slow flow',
  'Simplicity vs specialization: fewer agents easier to operate',
];
const FAILURES = [
  { risk: 'Tool cascade failure', mit: 'Circuit breaker' },
  { risk: 'State drift', mit: 'Checkpoint schema' },
  { risk: 'Retrieval collapse', mit: 'Hybrid search' },
  { risk: 'Prompt injection', mit: 'Input guardrails' },
  { risk: 'Eval blind spot', mit: 'E2E traces' },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch { /* retry */ }
    await sleep(400);
  }
  throw new Error(`Server not ready at ${url} after ${timeoutMs}ms`);
}

function assertTruthy(val, label) {
  if (!val) throw new Error(`Assertion failed: ${label}`);
}

async function fillFullWizard(page) {
  await page.fill('[data-wizard="scenario"]', 'Enterprise dev agent for platform team');
  await page.fill('[data-wizard="justify"]', 'Supervisor pattern with strategic HITL gates');
  await page.fill('[data-wizard="annotations"]', 'HITL before external deploy actions');
  for (let i = 0; i < 3; i++) {
    await page.fill(`[data-wizard-tradeoff="${i}"]`, TRADEOFFS[i]);
  }
  for (let i = 0; i < 5; i++) {
    await page.fill(`[data-wizard-fail-risk="${i}"]`, FAILURES[i].risk);
    await page.fill(`[data-wizard-fail-mit="${i}"]`, FAILURES[i].mit);
  }
  await page.fill('[data-wizard="costLatency"]', 'Semantic cache + model routing');
}

async function runPlaywright() {
  const logs = [];
  const log = (msg) => { logs.push(msg); console.log(msg); };

  let server;
  let mdCapture = '';
  try {
    const { chromium } = await import('playwright');
    server = spawn('npx', ['--yes', 'serve', 'web', '-l', String(PORT)], { cwd: ROOT, stdio: 'pipe' });
    await waitForServer(URL, 15000);

    try { unlinkSync(join(SCRATCH, 'launch-failure.txt')); } catch { /* ok */ }

    for (let launch = 1; launch <= 2; launch++) {
      log(`\n=== Launch ${launch} ===`);
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(URL, { waitUntil: 'networkidle' });
      await page.waitForSelector('#app');

      await page.click('[data-view="workspace"]');
      await page.waitForSelector('.canvas-bg');

      await page.click('.canvas-bg', { position: { x: 150, y: 120 } });
      await page.click('.canvas-bg', { position: { x: 400, y: 120 } });
      await sleep(150);
      await page.locator('.canvas-node').nth(0).click();
      await page.locator('.canvas-node').nth(1).click();
      await sleep(150);

      await fillFullWizard(page);
      await sleep(200);

      const validationText = await page.textContent('#validation-status');
      log(`Validation status: ${validationText}`);
      assertTruthy(validationText?.includes('Interview-ready'), 'wizard complete in UI');

      const exportResult = await page.evaluate(async () => {
        const md = window.__AAA?.generateMd?.() ?? '';
        const run = await window.__AAA?.runExport?.();
        return { ...run, md };
      });
      mdCapture = exportResult.md || '';
      log(`Export md length: ${mdCapture.length}`);
      log(`Tradeoffs in md: ${TRADEOFFS.filter((t) => mdCapture.includes(t.split(':')[0])).length}`);
      log(`Failures in md: ${FAILURES.filter((f) => mdCapture.includes(f.risk)).length}`);

      assertTruthy(exportResult.pngPrefix?.startsWith('data:image/png'), 'png');
      assertTruthy((mdCapture.match(/^## \d/gm) || []).length >= 7, '7 sections');
      TRADEOFFS.forEach((t) => assertTruthy(mdCapture.includes(t), `tradeoff: ${t}`));
      FAILURES.forEach((f) => assertTruthy(mdCapture.includes(f.risk), `failure: ${f.risk}`));

      const downloads = [];
      page.on('download', (d) => downloads.push(d));
      await page.click('#export-btn');
      await sleep(1000);
      log(`Downloads: ${downloads.length} files`);
      assertTruthy(downloads.length >= 2, 'md+png downloads');

      assertTruthy(errors.length === 0, errors.join('; '));
      await browser.close();
    }

    writeFileSync(join(SCRATCH, 'launch-evidence.txt'), logs.join('\n'));
    writeFileSync(join(SCRATCH, 'launch-success.txt'), 'ALL LAUNCH CHECKS PASSED\n');
    writeFileSync(join(SCRATCH, 'wizard-export-sample.md'), mdCapture);
    return true;
  } catch (err) {
    const msg = `Launch verification failed: ${err.message}\n${logs.join('\n')}`;
    writeFileSync(join(SCRATCH, 'launch-evidence.txt'), msg);
    writeFileSync(join(SCRATCH, 'launch-failure.txt'), msg);
    if (mdCapture) writeFileSync(join(SCRATCH, 'wizard-export-sample.md'), mdCapture);
    console.error(msg);
    return false;
  } finally {
    server?.kill();
  }
}

const ok = await runPlaywright();
process.exit(ok ? 0 : 1);