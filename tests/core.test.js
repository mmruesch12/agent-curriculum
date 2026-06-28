import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createReactState, reactStep, toggleReflection, getReactScenarios } from '../web/js/core/react-simulator.js';
import { switchTopology, getTopologyModes, computeTopologyLayout } from '../web/js/core/topology-simulator.js';
import { getLangGraphView, stepLangGraph, resetLangGraph, getLangGraphBranches, getLangGraphDisplay } from '../web/js/core/langgraph-simulator.js';
import { simulateRagCascade, getRagModes, getRagFailurePoints } from '../web/js/core/rag-simulator.js';
import { createTimelineState, advanceTimeline, simulateCrash, simulateResume } from '../web/js/core/checkpoint-timeline.js';
import { getTrace, selectSpan, injectFailureMode, createTraceState, getFailureModes } from '../web/js/core/trace-simulator.js';
import { createHitlState, placeHitlGate } from '../web/js/core/hitl-simulator.js';
import { getIntegrationDiff } from '../web/js/core/integration-simulator.js';
import { createSketch, addNode, addEdge, compareSketches, moveNode, setAnnotations, removeNode, clearSketch } from '../web/js/core/sketch-model.js';
import { renderSketchSvg } from '../web/js/core/sketch-render.js';
import { validateSketch } from '../web/js/core/validators.js';
import { generateExport, rasterizeSvgToPng, svgToDataUrl } from '../web/js/core/export.js';
import { createDefaultProgress, computeModuleRings, computeReviewItems } from '../web/js/core/progress.js';
import { evaluateCheckpoint } from '../web/js/core/checkpoints.js';
import { MODULES, CAPSTONES, WIZARD_STEPS } from '../web/js/data/curriculum.js';

describe('ReAct simulator', () => {
  it('advances through Thought/Action/Observation cycle', () => {
    let s = createReactState(false);
    const texts = [];
    for (let i = 0; i < 6; i++) {
      const r = reactStep(s, 'advance');
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
    for (let i = 0; i < 8; i++) s = reactStep(s, 'advance').state;
    const last = s.steps[s.steps.length - 1];
    assert.match(last.text, /Reflection:/);
  });

  it('does not mutate input state', () => {
    const s = createReactState(false);
    const frozen = JSON.stringify(s);
    reactStep(s, 'advance');
    assert.equal(JSON.stringify(s), frozen);
  });

  it('supports reset and scenario switching with phase-distinct step text', () => {
    let s = createReactState(true);
    s = reactStep(s, 'advance').state;
    s = reactStep(s, 'reset').state;
    assert.equal(s.stepIndex, 0);
    assert.equal(s.steps.length, 0);
    const scenarios = getReactScenarios();
    assert.ok(scenarios.length >= 3);
    const switched = reactStep(s, 'setScenario', 'incident');
    assert.equal(switched.state.scenarioId, 'incident');
    assert.match(switched.display, /Incident/);
    let incident = createReactState(false, 'incident');
    const phases = [];
    for (let i = 0; i < 6; i++) {
      const r = reactStep(incident, 'advance');
      incident = r.state;
      phases.push(r.entry.phase);
      if (r.entry.phase === 'thought') assert.match(r.entry.text, /^Thought:/);
      if (r.entry.phase === 'action') assert.match(r.entry.text, /^Action:/);
      if (r.entry.phase === 'observation') assert.match(r.entry.text, /^Observation:/);
    }
    assert.deepEqual(phases, ['thought', 'action', 'observation', 'thought', 'action', 'observation']);
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
    assert.ok(sup.metrics.edgeCount >= 3);
  });

  it('computes layout with edge paths from graph structure', () => {
    const topo = switchTopology('router');
    const layout = computeTopologyLayout(topo.topology);
    assert.equal(Object.keys(layout.positions).length, 4);
    assert.ok(layout.edgePaths.length >= 4);
    assert.ok(layout.edgePaths.some((e) => e.parallel));
  });
});

describe('LangGraph simulator', () => {
  it('getLangGraphDisplay does not advance state on read', () => {
    const view = getLangGraphView();
    assert.ok(view.highlights.persistence.includes('checkpoint'));
    assert.ok(view.highlights.interrupts.includes('hitl'));
    const s = resetLangGraph();
    const display = getLangGraphDisplay(s);
    assert.equal(display.activeNode, 'start');
    assert.match(display.message, /START/);
    assert.equal(s.currentNode, 'start');
    assert.equal(s.stepIndex, 0);
  });

  it('stepLangGraph advances only on explicit step', () => {
    let s = resetLangGraph();
    const r = stepLangGraph(s);
    assert.equal(r.activeNode, 'plan');
    assert.ok(r.message.includes('Plan'));
    s = r.state;
    const still = getLangGraphDisplay(s);
    assert.equal(still.activeNode, 'plan');
  });

  it('offers branch choices at conditional nodes', () => {
    let s = resetLangGraph();
    s = stepLangGraph(s).state;
    s = stepLangGraph(s).state;
    const atPlan = stepLangGraph(s);
    assert.ok(atPlan.branches.length >= 1);
    const branches = getLangGraphBranches('plan');
    assert.ok(branches.some((b) => b.branch === 'tools'));
    const chosen = stepLangGraph(atPlan.state, 'tools');
    assert.ok(chosen.message.includes('Execute'));
  });
});

describe('RAG simulator', () => {
  it('shows cascade on vector failure', () => {
    const r = simulateRagCascade('vector', 'vector_search');
    assert.ok(r.failureCount >= 2);
    assert.ok(r.path.some((p) => p.status === 'cascade'));
    assert.equal(r.failurePoint, 'vector_search');
    assert.match(r.recoveryHint, /Fallback/);
  });

  it('supports hybrid mode with fusion failure', () => {
    assert.ok(getRagModes().includes('hybrid'));
    const points = getRagFailurePoints('hybrid');
    assert.ok(points.includes('fusion'));
    const r = simulateRagCascade('hybrid', 'fusion');
    assert.ok(r.failureCount >= 2);
    assert.equal(r.mode, 'hybrid');
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

  it('expands spans and injects failure modes', () => {
    let s = createTraceState();
    const sel = selectSpan(s, 's1');
    assert.ok(sel.expanded.children.length >= 1);
    assert.ok(sel.expanded.totalDuration > sel.expanded.span.duration);
    const inj = injectFailureMode(sel.state, 'f1');
    assert.equal(inj.injected.id, 'f1');
    assert.ok(inj.mitigations.length >= 1);
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
  it('addEdge rejects dangling endpoint ids', () => {
    const sketch = createSketch('edge test');
    const result = addEdge(sketch, 'ghost-a', 'ghost-b');
    assert.equal(result.edges.length, 0);
  });

  it('supports named node types, move, annotations, delete and clear', () => {
    let sketch = createSketch('Test');
    sketch = addNode(sketch, 'Agent', 'Main Agent', 100, 100);
    sketch = addNode(sketch, 'HITL', 'Approval', 200, 100);
    sketch = addEdge(sketch, sketch.nodes[0].id, sketch.nodes[1].id, 'approve');
    sketch = moveNode(sketch, sketch.nodes[0].id, 150, 120);
    sketch = setAnnotations(sketch, 'HITL before external tool calls');
    assert.equal(sketch.nodes[0].x, 150);
    assert.match(sketch.annotations, /HITL/);
    const nodeId = sketch.nodes[1].id;
    sketch = removeNode(sketch, nodeId);
    assert.equal(sketch.nodes.length, 1);
    assert.equal(sketch.edges.length, 0);
    sketch = clearSketch(sketch);
    assert.equal(sketch.nodes.length, 0);
    const diff = compareSketches(sketch, createSketch('Empty'));
    assert.equal(diff.nodeCountDiff, 0);
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
  const mockEnv = {
    Image: class {
      set src(v) { this._src = v; setTimeout(() => this.onload?.(), 0); }
    },
    document: {
      createElement: () => ({
        width: 0, height: 0,
        getContext: () => ({ fillStyle: '', fillRect() {}, drawImage() {} }),
        toDataURL: (fmt) => `data:${fmt};base64,abc`,
      }),
    },
  };

  it('renderSketchSvg output rasterizes to PNG with edge labels', async () => {
    let sketch = createSketch('PNG path test');
    sketch = addNode(sketch, 'Agent', 'Main', 50, 50);
    sketch = addNode(sketch, 'Router', 'Route', 200, 50);
    sketch = addEdge(sketch, sketch.nodes[0].id, sketch.nodes[1].id, 'route');
    const svg = renderSketchSvg(sketch);
    assert.match(svg, /xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    assert.match(svg, /width="800"/);
    assert.match(svg, /route/);
    assert.doesNotMatch(svg, /width="100%"/);
    const png = await rasterizeSvgToPng(svg, 800, 400, mockEnv);
    assert.match(png, /^data:image\/png/);
  });

  it('user-built sketch flow produces export with edges and annotations', async () => {
    let sketch = createSketch('Flow test');
    sketch = addNode(sketch, 'Agent', 'A', 10, 10);
    sketch = addNode(sketch, 'Tool', 'T', 150, 10);
    sketch = addEdge(sketch, sketch.nodes[0].id, sketch.nodes[1].id);
    sketch = setAnnotations(sketch, 'notes here');
    const md = generateExport(sketch, {
      scenario: 's', justify: 'j',
      tradeoffs: ['a', 'b', 'c'],
      failures: Array(5).fill({ risk: 'r', mitigation: 'm' }),
      costLatency: 'c', teachBackCompleted: true,
    });
    assert.match(md, /notes here/);
    assert.match(md, /1 edges|Edges: 1|→/);
    const svg = renderSketchSvg(sketch);
    const png = await rasterizeSvgToPng(svg, 800, 400, mockEnv);
    assert.match(png, /^data:image\/png/);
    assert.match(svgToDataUrl(svg), /^data:image\/svg\+xml/);
  });

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

  it('evaluates checkpoint with stricter curriculum keyword requirements', () => {
    const cp = MODULES[0].checkpoints[0];
    const good = evaluateCheckpoint(
      'Enterprise governance and audit oversight reduce risk because compliance requires human control and liability management in regulated systems',
      cp,
    );
    assert.equal(good.pass, true);
    assert.ok(good.matchedKeywords.length >= 3);
    assert.ok(good.metrics.wordCount >= 12);
    assert.ok(good.metrics.charCount >= 60);

    const weakKeywords = evaluateCheckpoint(
      'Governance and audit are important for enterprise.',
      cp,
    );
    assert.equal(weakKeywords.pass, false);
    assert.ok(weakKeywords.matchedKeywords.length < 3);

    const short = evaluateCheckpoint('yes', cp);
    assert.equal(short.pass, false);
    assert.match(short.feedback, /empty|Need at least/i);
  });
});