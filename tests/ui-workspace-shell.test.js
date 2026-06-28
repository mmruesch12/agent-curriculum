import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CAPSTONES } from '../web/js/data/curriculum.js';
import { createDefaultWorkspace, placeNode } from '../web/js/core/workspace-controller.js';
import {
  applyWizardInput,
  getWorkspaceChromeState,
  runCapstoneConnectWizardFlow,
} from '../web/js/core/workspace-shell.js';

const WIZARD = {
  scenario: 'Enterprise research agent with GraphRAG',
  justify: 'Supervisor with reflection critic',
  annotations: 'HITL before external escalation',
  tradeoffs: ['latency vs quality', 'cost vs reflection', 'simplicity vs specialization'],
  failures: [
    { risk: 'Retrieval failure', mitigation: 'Hybrid search' },
    { risk: 'Tool cascade', mitigation: 'Circuit breaker' },
    { risk: 'State drift', mitigation: 'Checkpoints' },
    { risk: 'Injection', mitigation: 'Guardrails' },
    { risk: 'Eval gap', mitigation: 'E2E traces' },
  ],
  costLatency: 'Semantic cache',
};

describe('ui-workspace-shell (app.js listener path)', () => {
  it('partial wizard fill surfaces tradeoff minimum error via shell chrome', () => {
    let ws = createDefaultWorkspace();
    ws = applyWizardInput(ws, 'scenario', WIZARD.scenario);
    ws = applyWizardInput(ws, 'justify', WIZARD.justify);
    ws = applyWizardInput(ws, 'tradeoff:0', WIZARD.tradeoffs[0]);

    const chrome = getWorkspaceChromeState(ws);
    assert.equal(chrome.complete, false);
    assert.match(chrome.statusText, /tradeoff/i);
    assert.match(chrome.statusText, /At least 3 tradeoffs required/);
  });

  it('applyWizardInput + getWorkspaceChromeState mirrors bindWizardInputs + syncWorkspaceChrome', () => {
    let ws = createDefaultWorkspace();
    ws = applyWizardInput(ws, 'scenario', WIZARD.scenario);
    ws = applyWizardInput(ws, 'justify', WIZARD.justify);
    WIZARD.tradeoffs.forEach((t, i) => { ws = applyWizardInput(ws, `tradeoff:${i}`, t); });
    WIZARD.failures.forEach((f, i) => {
      ws = applyWizardInput(ws, `fail-risk:${i}`, f.risk);
      ws = applyWizardInput(ws, `fail-mit:${i}`, f.mitigation);
    });
    ws = applyWizardInput(ws, 'costLatency', WIZARD.costLatency);

    let chrome = getWorkspaceChromeState(ws);
    assert.equal(chrome.complete, false);
    assert.equal(chrome.statusText, 'Sketch must have at least one node');
    assert.equal(chrome.countLabel, '0 nodes, 0 edges');

    ws = applyWizardInput(ws, 'annotations', 'note');
    ws = placeNode(ws, 'Agent', 50, 50);
    chrome = getWorkspaceChromeState(ws);
    assert.equal(chrome.complete, true);
    assert.equal(chrome.statusText, 'Interview-ready structure ✓');
    assert.equal(chrome.countLabel, '1 nodes, 0 edges');
  });

  it('capstone load + connect + full wizard produces edge and interview-ready export', () => {
    const result = runCapstoneConnectWizardFlow(
      createDefaultWorkspace(),
      CAPSTONES[0],
      'GraphRAG Retriever',
      'Session Memory',
      WIZARD,
    );
    assert.equal(result.edgeAdded, true);
    assert.equal(result.edgesAfter, result.edgesBefore + 1);
    assert.ok(result.newEdge);
    assert.equal(result.newEdge.from, 'n2');
    assert.equal(result.newEdge.to, 'n3');
    assert.equal(result.chrome.complete, true);
    assert.match(result.md, /GraphRAG Retriever/);
    assert.match(result.md, /n2 → n3/);
    WIZARD.tradeoffs.forEach((t) => assert.match(result.md, new RegExp(t.split(' ')[0])));
    WIZARD.failures.forEach((f) => assert.match(result.md, new RegExp(f.risk)));
  });
});