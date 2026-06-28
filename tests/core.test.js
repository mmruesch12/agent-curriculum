import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createReactState, reactStep, toggleReflection } from '../web/js/core/react-simulator.js';
import { switchTopology, getTopologyModes } from '../web/js/core/topology-simulator.js';
import { getLangGraphView, stepLangGraph } from '../web/js/core/langgraph-simulator.js';
import { simulateRagCascade } from '../web/js/core/rag-simulator.js';
import { createTimelineState, advanceTimeline, simulateCrash, simulateResume } from '../web/js/core/checkpoint-timeline.js';
import { getTrace, getFailureModes } from '../web/js/core/trace-simulator.js';
import { createHitlState, placeHitlGate } from '../web/js/core/hitl-simulator.js';
import { getIntegrationDiff } from '../web/js/core/integration-simulator.js';
import { createSketch, addNode, addEdge, compareSketches } from '../web/js/core/sketch-model.js';
import { validateSketch } from '../web/js/core/validators.js';
import { generateExport } from '../web/js/core/export.js';
import { createDefaultProgress, computeModuleRings, computeReviewItems } from '../web/js/core/progress.js';
import { evaluateCheckpoint } from '../web/js/core/checkpoints.js';
import { MODULES, CAPSTONES, WIZARD_STEPS } from '../web/js/data/curriculum.js';

describe('ReAct simulator', () => {
  it('advances through Thought/Action/Observation cycle', () => {
    let s = createReactState(false);
    const texts = [];
    for (let i = 0; i < 6; i++) {
      const r = reactStep(s);
      s = r.state;
      if (r.entry) texts.push(r.entry.text);
    }
    const combined = texts.join('\n');
    assert.match(combined, /Thought:/);
    assert.match(combined, /Action:/);
    assert.match(combined, /Observation:/);
  });

  it('adds reflection output when enabled', () => {
    let s = toggleReflection(createReactState(false), true);
    for (let i = 0; i < 8; i++) s = reactStep(s).state;
    const last = s.steps[s.steps.length - 1];
    assert.match(last.text, /Reflection:/);
  });
});

describe('Topology simulator', () => {
  it('returns distinct tradeoff panels per mode', () => {
    const modes = getTopologyModes();
    assert.equal(modes.length, 4);
    const panels = modes.map((m) => switchTopology(m).tradeoffPanel);
    assert.ok(new Set(panels).size >= 3);
    const sup = switchTopology('supervisor');
    assert.match(sup.tradeoffPanel, /isolation/);
  });
});

describe('LangGraph simulator', () => {
  it('highlights persistence and interrupt nodes', () => {
    const view = getLangGraphView();
    assert.ok(view.highlights.persistence.includes('checkpoint'));
    assert.ok(view.highlights.interrupts.includes('hitl'));
    let s = { stepIndex: 0 };
    const r = stepLangGraph(s);
    assert.equal(r.activeNode, 'start');
  });
});

describe('RAG simulator', () => {
  it('shows cascade on vector failure', () => {
    const r = simulateRagCascade('vector', 'vector_search');
    assert.ok(r.failureCount >= 1);
    assert.ok(r.path.some((p) => p.status === 'cascade'));
  });
});

describe('Checkpoint timeline', () => {
  it('resumes from last checkpoint after crash', () => {
    let s = createTimelineState();
    s = advanceTimeline(s).state;
    s = advanceTimeline(s).state;
    s = simulateCrash(s).state;
    const r = simulateResume(s);
    assert.equal(r.resumed, true);
    assert.ok(r.state.checkpoints.length >= 2);
  });
});

describe('Trace and HITL', () => {
  it('returns five failure modes', () => {
    assert.equal(getFailureModes().length, 5);
    assert.ok(getTrace().spans.length >= 3);
  });

  it('builds governance checklist on gate placement', () => {
    let s = createHitlState();
    s = placeHitlGate(s, 'pre-deploy').state;
    const r = placeHitlGate(s, 'financial');
    assert.ok(r.checklist.some((c) => c.id === 'audit'));
  });
});

describe('Integration diff', () => {
  it('includes 2026 trends', () => {
    const d = getIntegrationDiff();
    assert.ok(d.trends2026.some((t) => t.id === 'mcp'));
    assert.notEqual(d.prototype.auth, d.enterprise.auth);
  });
});

describe('Sketch model and validators', () => {
  it('supports named node types', () => {
    let sketch = createSketch('Test');
    sketch = addNode(sketch, 'Agent', 'Main Agent', 100, 100);
    sketch = addNode(sketch, 'HITL', 'Approval', 200, 100);
    sketch = addEdge(sketch, sketch.nodes[0].id, sketch.nodes[1].id, 'approve');
    assert.equal(sketch.nodes.length, 2);
    const diff = compareSketches(sketch, createSketch('Empty'));
    assert.ok(diff.missingInB.length > 0);
  });

  it('validates wizard minimums from curriculum', () => {
    const sketch = createSketch('Capstone');
    sketch.nodes.push({ id: 'n1', type: 'Agent', label: 'A', x: 0, y: 0 });
    const wizard = {
      scenario: 'Enterprise platform team dev agent',
      justify: 'Supervisor pattern for modularity',
      tradeoffs: ['latency vs quality', 'cost vs reflection', 'simplicity vs specialization'],
      failures: Array(5).fill({ risk: 'tool error', mitigation: 'circuit breaker' }),
      costLatency: 'Batch async for cost',
      teachBackCompleted: true,
    };
    const v = validateSketch(sketch, wizard);
    assert.equal(v.complete, true);
    assert.equal(v.counts.tradeoffs, 3);
    assert.equal(v.counts.failures, 5);
  });
});

describe('Export generator', () => {
  it('emits 7 structured sections', () => {
    const sketch = CAPSTONES[0];
    const wizard = {
      scenario: CAPSTONES[0].description,
      justify: 'GraphRAG for relational queries',
      tradeoffs: ['a', 'b', 'c'],
      failures: Array(5).fill({ risk: 'retrieval fail', mitigation: 'hybrid search' }),
      costLatency: 'Semantic cache',
      teachBackCompleted: false,
    };
    const md = generateExport(sketch, wizard);
    WIZARD_STEPS.forEach((step) => assert.match(md, new RegExp(step.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
    assert.match(md, /GraphRAG/);
  });
});

describe('Progress and checkpoints', () => {
  it('computes module rings', () => {
    const p = createDefaultProgress();
    p.moduleCompletion = { 1: true, 2: true };
    const rings = computeModuleRings(p);
    assert.equal(rings.completed, 2);
    assert.equal(rings.total, 9);
  });

  it('surfaces review items after day 3', () => {
    const p = createDefaultProgress();
    p.startDate = Date.now() - 4 * 24 * 60 * 60 * 1000;
    p.checkpointAnswers = { 'm1-cp0': { answer: 'governance', timestamp: Date.now() - 5000 } };
    const review = computeReviewItems(p);
    assert.ok(review.dueDays.includes(3));
    assert.ok(review.items.length >= 1);
  });

  it('evaluates checkpoint with curriculum keywords', () => {
    const cp = MODULES[0].checkpoints[0];
    const pass = evaluateCheckpoint('Enterprise governance and audit oversight reduce risk', cp);
    assert.equal(pass.pass, true);
    const fail = evaluateCheckpoint('yes', cp);
    assert.equal(fail.pass, false);
  });
});