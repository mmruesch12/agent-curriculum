#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRATCH = process.env.SCRATCH || '/var/folders/h5/777kg7xs0d3345cjkktl8qxc0000gn/T/grok-goal-5c88c7a4a5ac/implementer';
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

async function drivePatternLab(page, log) {
  await page.click('[data-view="pattern-lab"]');
  await page.waitForSelector('#sim-container');
  await page.selectOption('#sim-select', 'react');
  await page.waitForSelector('#react-step');
  await page.click('#react-step');
  await sleep(100);
  const afterThought = await page.textContent('#react-display');
  assertTruthy(afterThought?.includes('Thought:'), 'react shows Thought phase');
  await page.click('#react-step');
  await sleep(100);
  const afterAction = await page.textContent('#react-display');
  log(`Pattern Lab ReAct after action: ${afterAction?.slice(0, 60)}`);
  assertTruthy(afterAction?.includes('Action:'), 'react shows Action phase');
  await page.click('#react-step');
  await sleep(100);
  const afterObservation = await page.textContent('#react-display');
  log(`Pattern Lab ReAct after observation: ${afterObservation?.slice(0, 60)}`);
  assertTruthy(afterObservation?.includes('Observation:'), 'react shows Observation phase');

  await page.selectOption('#sim-select', 'topology');
  await page.waitForSelector('[data-topo="router"]');
  await page.click('[data-topo="router"]');
  const tradeoff = await page.textContent('.tradeoff-panel');
  log(`Topology tradeoff panel length: ${tradeoff?.length}`);
  assertTruthy((tradeoff?.length || 0) > 40, 'topology panel filled');
}

async function driveModules(page, log) {
  await page.click('[data-view="modules"]');
  await page.waitForSelector('.module-grid');
  const moduleCards = await page.locator('.module-card').count();
  log(`Module grid cards: ${moduleCards}`);
  assertTruthy(moduleCards >= 9, 'module grid populated');
  const objectives = await page.locator('.glass-card ul li').count();
  log(`Module objectives listed: ${objectives}`);
  assertTruthy(objectives >= 1, 'module content filled');
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
      await page.waitForSelector('#progress-ring');
      const hasSidebarToggle = await page.locator('#sidebar-toggle').count();
      assertTruthy(hasSidebarToggle === 1, 'sidebar-toggle in DOM');
      const dashboardStats = await page.locator('.stat-card').count();
      log(`Primary surfaces: progress-ring, sidebar-toggle, dashboard stats=${dashboardStats}`);
      assertTruthy(dashboardStats >= 4, 'dashboard stats filled');

      await drivePatternLab(page, log);
      await driveModules(page, log);

      await page.click('[data-view="workspace"]');
      await page.waitForSelector('.canvas-bg');
      const canvasDims = await page.evaluate(() => {
        const svg = document.querySelector('.workspace-svg');
        return { width: svg?.getAttribute('width'), height: svg?.getAttribute('height') };
      });
      log(`Canvas dimensions: ${canvasDims?.width}x${canvasDims?.height}`);
      assertTruthy(canvasDims?.width === '800' && canvasDims?.height === '400', 'canvas 800x400');

      await page.click('[data-capstone="research-agent"]');
      await sleep(200);
      const capNodesBefore = await page.locator('.canvas-node').count();
      log(`Capstone nodes: ${capNodesBefore}`);
      assertTruthy(capNodesBefore >= 4, 'capstone nodes loaded');

      const edgeLabels = await page.evaluate(() =>
        [...document.querySelectorAll('.edge-group text')].map((t) => t.textContent),
      );
      log(`Capstone edge labels on canvas: ${edgeLabels.join(', ')}`);
      assertTruthy(edgeLabels.length >= 3, 'edge labels visible on canvas');

      const retriever = page.locator('.canvas-node').filter({ hasText: 'GraphRAG' });
      const memory = page.locator('.canvas-node').filter({ hasText: 'Session Memory' });
      await retriever.click();
      await memory.click();
      await sleep(200);

      const countAfterConnect = await page.textContent('[data-sketch-count]');
      log(`After capstone connect: ${countAfterConnect}`);
      assertTruthy(countAfterConnect?.includes('4 edges'), `capstone edge added: ${countAfterConnect}`);

      await fillFullWizard(page);
      await sleep(200);

      const wizardFill = await page.evaluate(() => ({
        scenario: document.querySelector('[data-wizard="scenario"]')?.value?.length || 0,
        justify: document.querySelector('[data-wizard="justify"]')?.value?.length || 0,
        tradeoffs: [...document.querySelectorAll('[data-wizard-tradeoff]')].filter((el) => el.value.length > 5).length,
        failures: [...document.querySelectorAll('[data-wizard-fail-risk]')].filter((el) => el.value.length > 3).length,
        annotations: document.querySelector('[data-wizard="annotations"]')?.value?.length || 0,
      }));
      log(`Wizard fields filled: scenario=${wizardFill.scenario} justify=${wizardFill.justify} tradeoffs=${wizardFill.tradeoffs} failures=${wizardFill.failures} annotations=${wizardFill.annotations}`);
      assertTruthy(wizardFill.scenario > 10, 'scenario filled');
      assertTruthy(wizardFill.tradeoffs >= 3, 'tradeoffs filled');
      assertTruthy(wizardFill.failures >= 5, 'failures filled');

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
      log(`Export nodes=${exportResult.nodes} edges=${exportResult.edges} sections=${exportResult.mdSections}`);

      assertTruthy(exportResult.pngPrefix?.startsWith('data:image/png'), 'png');
      assertTruthy((mdCapture.match(/^## \d/gm) || []).length >= 7, '7 sections');
      TRADEOFFS.forEach((t) => assertTruthy(mdCapture.includes(t), `tradeoff: ${t}`));
      FAILURES.forEach((f) => assertTruthy(mdCapture.includes(f.risk), `failure: ${f.risk}`));
      assertTruthy(mdCapture.includes('n2 → n3') || mdCapture.includes('GraphRAG Retriever'), 'capstone edge in export');

      const downloads = [];
      page.on('download', (d) => downloads.push(d));
      await page.click('#export-btn');
      await sleep(1000);
      log(`Downloads: ${downloads.length} files`);
      assertTruthy(downloads.length >= 2, 'md+png downloads');

      assertTruthy(errors.length === 0, errors.join('; '));
      log(`Launch ${launch} PASSED — surfaces substantially filled`);
      await browser.close();
    }

    writeFileSync(join(SCRATCH, 'launch-evidence.txt'), logs.join('\n'));
    writeFileSync(join(SCRATCH, 'launch-success.txt'), 'ALL LAUNCH CHECKS PASSED (2 launches)\n');
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