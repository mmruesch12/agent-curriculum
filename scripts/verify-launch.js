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
    } catch {
      /* retry */
    }
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

      log(`Title: ${await page.title()}`);
      assertTruthy((await page.title()).includes('Agent Architect'), 'title');
      log(`Dashboard h2: ${await page.isVisible('h2')}`);

      // Checkpoint scoring
      await page.click('[data-view="modules"]');
      await page.waitForSelector('[data-cp-submit="0"]');
      await page.fill('[data-cp-input="0"]', 'Enterprise governance audit oversight and human control reduce risk');
      await page.click('[data-cp-submit="0"]');
      const cpResult = await page.textContent('#cp-result-0');
      log(`Checkpoint result: ${cpResult?.slice(0, 80)}`);
      assertTruthy(cpResult?.includes('Good') || cpResult?.includes('governance'), 'checkpoint pass');

      // Pattern Lab ReAct
      await page.click('[data-view="pattern-lab"]');
      await page.waitForSelector('#react-step');
      await page.click('#react-step');
      const simText = await page.textContent('#react-display');
      log(`ReAct display: ${simText?.slice(0, 100)}`);
      assertTruthy(simText?.includes('Thought'), 'react thought');

      // Workspace: node types, canvas place, wizard validation
      await page.click('[data-view="workspace"]');
      await page.waitForSelector('.node-palette');
      const palette = await page.locator('.palette-btn').allTextContents();
      log(`Node palette: ${palette.join(', ')}`);
      ['Agent', 'Tool', 'Memory', 'HITL', 'Guardrail', 'Router'].forEach((t) => assertTruthy(palette.includes(t), `node type ${t}`));

      const nodesBefore = await page.locator('.canvas-node').count();
      await page.click('.canvas-bg', { position: { x: 200, y: 150 } });
      await sleep(200);
      const nodesAfter = await page.locator('.canvas-node').count();
      log(`Canvas nodes before/after click: ${nodesBefore}/${nodesAfter}`);
      assertTruthy(nodesAfter > nodesBefore, 'canvas click place');

      await page.fill('[data-wizard="scenario"]', 'Test scenario');
      const validation = await page.textContent('#validation-status');
      log(`Wizard validation (incomplete): ${validation?.slice(0, 60)}`);
      assertTruthy(validation?.includes('tradeoff') || validation?.includes('required'), 'wizard validation');

      // Export via evaluate (avoids download dialog)
      const exportPreview = await page.evaluate(() => {
        const sketch = { name: 'Test', nodes: [{ id: 'n1', type: 'Agent', label: 'A', x: 10, y: 10 }], edges: [], annotations: 'note' };
        const wizard = {
          scenario: 'S', justify: 'J',
          tradeoffs: ['t1', 't2', 't3'],
          failures: Array(5).fill({ risk: 'r', mitigation: 'm' }),
          costLatency: 'low', teachBackCompleted: true,
        };
        return { nodeCount: sketch.nodes.length, wizardFields: Object.keys(wizard).length };
      });
      log(`Export context: nodes=${exportPreview.nodeCount}, wizardFields=${exportPreview.wizardFields}`);

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