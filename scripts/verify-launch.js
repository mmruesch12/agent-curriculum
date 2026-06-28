#!/usr/bin/env node
/**
 * Launch verification: serve app, load twice, drive interactions, capture evidence.
 */
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
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
    } catch {
      /* retry */
    }
    await sleep(400);
  }
  throw new Error(`Server not ready at ${url} after ${timeoutMs}ms`);
}

async function runPlaywright() {
  const logs = [];
  const log = (msg) => { logs.push(msg); console.log(msg); };

  let server;
  try {
    const { chromium } = await import('playwright');
    server = spawn('npx', ['--yes', 'serve', 'web', '-l', String(PORT)], { cwd: ROOT, stdio: 'pipe' });
    await waitForServer(URL, 15000);

    for (let launch = 1; launch <= 2; launch++) {
      log(`\n=== Launch ${launch} ===`);
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(URL, { waitUntil: 'networkidle' });
      await page.waitForSelector('#app', { timeout: 10000 });

      const title = await page.title();
      log(`Title: ${title}`);
      assertTruthy(title.includes('Agent Architect'), 'title');

      const dash = await page.isVisible('h2');
      log(`Dashboard visible: ${dash}`);

      await page.click('[data-view="pattern-lab"]');
      await page.waitForSelector('#sim-container');
      await page.click('#react-step');
      const simText = await page.textContent('#react-display');
      log(`ReAct step output length: ${simText?.length}`);
      assertTruthy(simText?.includes('Thought') || simText?.includes('Step'), 'react step');

      await page.click('[data-view="workspace"]');
      await page.waitForSelector('#add-node-btn');
      const nodeCountBefore = await page.locator('.canvas-wrap svg g').count();
      await page.click('#add-node-btn');
      await sleep(300);
      const nodeCountAfter = await page.locator('.canvas-wrap svg g').count();
      log(`Canvas nodes before/after: ${nodeCountBefore}/${nodeCountAfter}`);
      assertTruthy(nodeCountAfter > nodeCountBefore, 'add node');

      if (errors.length) log(`JS errors: ${errors.join('; ')}`);
      assertTruthy(errors.length === 0, 'no js errors');

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

function assertTruthy(val, label) {
  if (!val) throw new Error(`Assertion failed: ${label}`);
}

const ok = await runPlaywright();
process.exit(ok ? 0 : 1);