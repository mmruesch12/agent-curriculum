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

async function runPlaywright() {
  const logs = [];
  const log = (msg) => { logs.push(msg); console.log(msg); };

  let server;
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
      await page.waitForSelector('#app', { timeout: 10000 });

      await page.click('[data-view="modules"]');
      await page.fill('[data-cp-input="0"]', 'Enterprise governance audit oversight and human control reduce risk');
      await page.click('[data-cp-submit="0"]');
      log(`Checkpoint: ${(await page.textContent('#cp-result-0'))?.slice(0, 60)}`);

      await page.click('[data-view="pattern-lab"]');
      await page.click('#react-step');
      log(`ReAct: ${(await page.textContent('#react-display'))?.includes('Thought')}`);

      await page.click('[data-view="workspace"]');
      await page.waitForSelector('.canvas-bg');

      const nodesBefore = await page.locator('.canvas-node').count();
      await page.click('.canvas-bg', { position: { x: 150, y: 120 } });
      await page.click('.canvas-bg', { position: { x: 400, y: 120 } });
      await sleep(200);
      const nodesAfter = await page.locator('.canvas-node').count();
      log(`Nodes placed: ${nodesBefore} -> ${nodesAfter}`);
      assertTruthy(nodesAfter >= 2, 'two nodes placed');

      const countText = await page.textContent('[data-sketch-count]');
      log(`Sketch count UI: ${countText}`);
      assertTruthy(countText?.includes('2 nodes'), 'sidebar count updated');

      const node0 = page.locator('.canvas-node').nth(0);
      const node1 = page.locator('.canvas-node').nth(1);
      await node0.click();
      await node1.click();
      await sleep(200);
      const countAfterEdge = await page.textContent('[data-sketch-count]');
      log(`After edge connect: ${countAfterEdge}`);
      assertTruthy(countAfterEdge?.includes('1 edges') || countAfterEdge?.includes('1 edge'), 'edge created');

      await page.fill('[data-wizard="scenario"]', 'Enterprise dev agent');
      await page.fill('[data-wizard="justify"]', 'Supervisor with HITL');
      await page.fill('[data-wizard="annotations"]', 'Gate before deploy');

      const exportResult = await page.evaluate(async () => {
        if (!window.__AAA?.runExport) return { error: 'missing __AAA.runExport' };
        return window.__AAA.runExport();
      });
      log(`Browser export: png=${exportResult.pngPrefix}, sections=${exportResult.mdSections}, edges=${exportResult.edges}`);
      assertTruthy(exportResult.pngPrefix?.startsWith('data:image/png'), 'png in browser');
      assertTruthy(exportResult.mdSections >= 7, '7 md sections');
      assertTruthy(exportResult.edges >= 1, 'export has edges');
      assertTruthy(exportResult.hasAnnotations, 'annotations in sketch');

      const downloads = [];
      page.on('download', (d) => downloads.push(d.suggestedFilename()));
      await page.click('#export-btn');
      await sleep(800);
      log(`Export button downloads: ${downloads.join(', ')}`);
      assertTruthy(downloads.some((f) => f?.endsWith('.md')), 'md download');
      assertTruthy(downloads.some((f) => f?.endsWith('.png')), 'png download');

      assertTruthy(errors.length === 0, `js errors: ${errors.join('; ')}`);
      await browser.close();
    }

    writeFileSync(join(SCRATCH, 'launch-evidence.txt'), logs.join('\n'));
    writeFileSync(join(SCRATCH, 'launch-success.txt'), 'ALL LAUNCH CHECKS PASSED\n');
    return true;
  } catch (err) {
    const msg = `Launch verification failed: ${err.message}\n${logs.join('\n')}`;
    writeFileSync(join(SCRATCH, 'launch-evidence.txt'), msg);
    writeFileSync(join(SCRATCH, 'launch-failure.txt'), msg);
    console.error(msg);
    return false;
  } finally {
    server?.kill();
  }
}

const ok = await runPlaywright();
process.exit(ok ? 0 : 1);