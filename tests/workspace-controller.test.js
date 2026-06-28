import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CAPSTONES } from '../web/js/data/curriculum.js';
import { validateSketch } from '../web/js/core/validators.js';
import { generateExport } from '../web/js/core/export.js';
import {
  createDefaultWorkspace,
  loadCapstone,
  resetSketch,
  setWizardField,
  placeNode,
  selectNodeForEdge,
  connectNodes,
} from '../web/js/core/workspace-controller.js';

describe('workspace-controller', () => {
  it('load capstone then two-node connect yields one valid edge and cleared selection', () => {
    let ws = createDefaultWorkspace();
    ws = loadCapstone(ws, CAPSTONES[0]);
    assert.equal(ws.edgeSelection.first, null);
    const retriever = ws.sketch.nodes.find((n) => n.label === 'GraphRAG Retriever');
    const memory = ws.sketch.nodes.find((n) => n.label === 'Session Memory');
    const before = ws.sketch.edges.length;
    ws = selectNodeForEdge(ws, retriever.id);
    assert.equal(ws.edgeSelection.first, retriever.id);
    ws = selectNodeForEdge(ws, memory.id);
    assert.equal(ws.edgeSelection.first, null);
    assert.equal(ws.sketch.edges.length, before + 1);
    ws.sketch.edges.forEach((e) => {
      assert.ok(ws.sketch.nodes.some((n) => n.id === e.from));
      assert.ok(ws.sketch.nodes.some((n) => n.id === e.to));
    });
  });

  it('rejects connect when first selection references missing node after reset', () => {
    let ws = createDefaultWorkspace();
    ws = placeNode(ws, 'Agent', 10, 10);
    ws = placeNode(ws, 'Tool', 120, 10);
    const firstId = ws.sketch.nodes[0].id;
    const secondId = ws.sketch.nodes[1].id;
    ws = selectNodeForEdge(ws, firstId);
    ws = resetSketch(ws);
    ws = selectNodeForEdge(ws, secondId);
    assert.equal(ws.sketch.edges.length, 0);
    assert.equal(ws.edgeSelection.first, null);
  });

  it('full wizard fields produce complete validation and export content', () => {
    let ws = createDefaultWorkspace();
    ws = setWizardField(ws, 'scenario', 'Enterprise dev agent');
    ws = setWizardField(ws, 'justify', 'Supervisor with HITL');
    ws = setWizardField(ws, 'tradeoff:0', 'latency vs quality');
    ws = setWizardField(ws, 'tradeoff:1', 'cost vs reflection');
    ws = setWizardField(ws, 'tradeoff:2', 'simplicity vs specialization');
    for (let i = 0; i < 5; i++) {
      ws = setWizardField(ws, `fail-risk:${i}`, `risk-${i}`);
      ws = setWizardField(ws, `fail-mit:${i}`, `mit-${i}`);
    }
    ws = setWizardField(ws, 'costLatency', 'async batching');
    ws = setWizardField(ws, 'teachBackCompleted', true);
    ws = placeNode(ws, 'Agent', 50, 50);

    const v = validateSketch(ws.sketch, ws.wizard);
    assert.equal(v.complete, true);
    const md = generateExport(ws.sketch, ws.wizard);
    const tradeoffLines = md.split('\n').filter((l) => /^\d+\. latency|^\d+\. cost|^\d+\. simplicity/.test(l));
    const failureLines = md.split('\n').filter((l) => /^\d+\. \*\*risk-/.test(l));
    assert.ok(tradeoffLines.length >= 3);
    assert.ok(failureLines.length >= 5);
  });

  it('connectNodes rejects dangling endpoint ids', () => {
    let ws = createDefaultWorkspace();
    ws = connectNodes(ws, 'missing-a', 'missing-b');
    assert.equal(ws.sketch.edges.length, 0);
  });
});