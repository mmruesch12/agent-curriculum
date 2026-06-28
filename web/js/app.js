import { MODULES, CAPSTONES, TIMELINE, RESOURCES, WIZARD_STEPS, NODE_TYPES } from './data/curriculum.js';
import { createReactState, reactStep, toggleReflection } from './core/react-simulator.js';
import { switchTopology, getTopologyModes } from './core/topology-simulator.js';
import { getLangGraphView, stepLangGraph } from './core/langgraph-simulator.js';
import { simulateRagCascade, getRagModes } from './core/rag-simulator.js';
import { createTimelineState, advanceTimeline, simulateCrash, simulateResume, getPhases } from './core/checkpoint-timeline.js';
import { getTrace, expandSpan, getFailureModes } from './core/trace-simulator.js';
import { createHitlState, placeHitlGate, getHitlGates } from './core/hitl-simulator.js';
import { getIntegrationDiff } from './core/integration-simulator.js';
import { createSketch, addNode, addEdge, compareSketches, moveNode, setAnnotations } from './core/sketch-model.js';
import { validateSketch } from './core/validators.js';
import { generateExport, rasterizeSvgToPng } from './core/export.js';
import { loadProgress, saveProgress, recordActivity, markModuleComplete, computeModuleRings, computeReviewItems } from './core/progress.js';
import { evaluateCheckpoint } from './core/checkpoints.js';

const state = {
  view: 'dashboard',
  progress: loadProgress(),
  moduleId: 1,
  react: createReactState(false),
  topology: 'supervisor',
  langgraph: { stepIndex: 0 },
  rag: { mode: 'vector', failurePoint: null },
  timeline: createTimelineState(),
  hitl: createHitlState(),
  workspace: {
    sketch: createSketch('My Architecture'),
    wizard: {
      scenario: '',
      justify: '',
      tradeoffs: ['', '', ''],
      failures: Array(5).fill(null).map(() => ({ risk: '', mitigation: '' })),
      costLatency: '',
      teachBackCompleted: false,
    },
    compareSketch: null,
    selectedNodeType: 'Agent',
    edgeConnectFrom: null,
    drag: { nodeId: null, offsetX: 0, offsetY: 0 },
  },
};

const main = document.getElementById('main-content');
const reviewNudges = document.getElementById('review-nudges');

function init() {
  state.progress = recordActivity(state.progress);
  bindNav();
  render();
  document.addEventListener('keydown', handleGlobalKeys);
}

function bindNav() {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      if (state.view === 'modules' && !state.moduleId) state.moduleId = 1;
      document.querySelectorAll('.nav-link').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
      render();
    });
  });
}

function handleGlobalKeys(e) {
  if (e.key === 's' && e.ctrlKey && state.view === 'pattern-lab') {
    e.preventDefault();
    stepCurrentSimulator();
  }
}

function render() {
  updateProgressUI();
  switch (state.view) {
    case 'dashboard': renderDashboard(); break;
    case 'modules': renderModule(); break;
    case 'pattern-lab': renderPatternLab(); break;
    case 'workspace': renderWorkspace(); break;
    case 'resources': renderResources(); break;
    case 'review': renderReview(); break;
    default: renderDashboard();
  }
}

function updateProgressUI() {
  const rings = computeModuleRings(state.progress);
  document.getElementById('progress-ring').innerHTML = `
    <svg width="80" height="80" aria-hidden="true">
      <circle cx="40" cy="40" r="34" fill="none" stroke="#2d3a4f" stroke-width="6"/>
      <circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" stroke-width="6"
        stroke-dasharray="${rings.percent * 2.14} 214" stroke-linecap="round"/>
    </svg>
    <span class="label">${rings.completed}/${rings.total}</span>`;
  document.getElementById('streak-display').textContent = `🔥 ${state.progress.streak.count} day streak`;

  const review = computeReviewItems(state.progress);
  reviewNudges.innerHTML = review.items.length
    ? `<div class="review-nudge" role="status"><strong>Review due</strong> (Day ${review.dueDays.join(', ')})</div>`
    : '';

  document.querySelectorAll('.nav-link[data-view="modules"]').forEach((btn) => {
    btn.classList.toggle('completed', rings.completed === rings.total);
  });
}

function renderDashboard() {
  main.innerHTML = `
    <h2>Dashboard</h2>
    <div class="glass-card">
      <h3>Your Learning Journey</h3>
      <p>14–22 hours over 7–14 days. Breadth-first interview prep for production enterprise AI agents.</p>
      <table class="timeline-table" aria-label="Suggested timeline">
        <thead><tr><th>Days</th><th>Focus</th><th>Hours</th></tr></thead>
        <tbody>${TIMELINE.map((t) => `<tr><td>${t.days}</td><td>${t.focus}</td><td>${t.hours}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="glass-card">
      <h3>Quick Start</h3>
      <button class="btn" data-action="goto-modules">Start Module 1</button>
      <button class="btn btn-secondary" data-action="goto-lab">Open Pattern Lab</button>
      <button class="btn btn-secondary" data-action="goto-workspace">Architect Workspace</button>
    </div>`;
  main.querySelector('[data-action="goto-modules"]').onclick = () => { state.view = 'modules'; state.moduleId = 1; render(); };
  main.querySelector('[data-action="goto-lab"]').onclick = () => { state.view = 'pattern-lab'; render(); };
  main.querySelector('[data-action="goto-workspace"]').onclick = () => { state.view = 'workspace'; render(); };
}

function renderModule() {
  const mod = MODULES.find((m) => m.id === state.moduleId);
  main.innerHTML = `
    <h2>Module ${mod.id}: ${mod.title}</h2>
    <div class="glass-card">
      <h3>Objectives</h3>
      <ul>${mod.objectives.map((o) => `<li>${o}</li>`).join('')}</ul>
      <h3>Key Topics</h3>
      <div>${mod.lingo.map((l) => `<span class="tag" title="${l}">${l}</span>`).join('')}</div>
      <h3>Active Practice</h3>
      <ul>${mod.practice.map((p) => `<li>${p}</li>`).join('')}</ul>
    </div>
    <div class="glass-card">
      <h3>Checkpoints</h3>
      ${mod.checkpoints.map((cp, i) => `
        <div class="wizard-step" data-cp="${i}">
          <label>${cp.question}</label>
          <textarea aria-label="Checkpoint answer ${i + 1}" data-cp-input="${i}"></textarea>
          <button class="btn" data-cp-submit="${i}">Submit</button>
          <div class="checkpoint-result" id="cp-result-${i}" aria-live="polite"></div>
        </div>`).join('')}
    </div>
    <div>
      <button class="btn btn-secondary" data-prev ${mod.id <= 1 ? 'disabled' : ''}>← Previous</button>
      <button class="btn" data-next ${mod.id >= 9 ? 'disabled' : ''}>Next Module →</button>
      <button class="btn btn-secondary" data-goto-sim>Open Simulator</button>
    </div>`;

  mod.checkpoints.forEach((cp, i) => {
    main.querySelector(`[data-cp-submit="${i}"]`).onclick = () => {
      const answer = main.querySelector(`[data-cp-input="${i}"]`).value;
      const result = evaluateCheckpoint(answer, cp);
      const el = document.getElementById(`cp-result-${i}`);
      el.className = `checkpoint-result ${result.pass ? 'pass' : 'fail'}`;
      el.textContent = result.feedback;
      state.progress.checkpointAnswers[`m${mod.id}-cp${i}`] = { answer, result, timestamp: Date.now() };
      if (result.pass) {
        state.progress = markModuleComplete(state.progress, mod.id);
        saveProgress(state.progress);
      }
      updateProgressUI();
    };
  });

  main.querySelector('[data-prev]')?.addEventListener('click', () => { state.moduleId--; render(); });
  main.querySelector('[data-next]')?.addEventListener('click', () => { state.moduleId++; render(); });
  main.querySelector('[data-goto-sim]').onclick = () => { state.view = 'pattern-lab'; state.labSimulator = mod.simulator; render(); };
}

function renderPatternLab() {
  const sim = state.labSimulator || 'react';
  main.innerHTML = `
    <h2>Pattern Lab</h2>
    <div class="glass-card">
      <label for="sim-select">Simulator</label>
      <select id="sim-select" aria-label="Select simulator">
        <option value="react" ${sim === 'react' ? 'selected' : ''}>ReAct Stepper + Reflection</option>
        <option value="topology" ${sim === 'topology' ? 'selected' : ''}>Multi-Agent Topology Switcher</option>
        <option value="langgraph" ${sim === 'langgraph' ? 'selected' : ''}>LangGraph State Viewer</option>
        <option value="rag" ${sim === 'rag' ? 'selected' : ''}>RAG Failure Cascade</option>
        <option value="timeline" ${sim === 'timeline' ? 'selected' : ''}>Checkpoint Timeline</option>
        <option value="trace" ${sim === 'trace' ? 'selected' : ''}>Trace + Failure Explorer</option>
        <option value="hitl" ${sim === 'hitl' ? 'selected' : ''}>HITL / Guardrail Placement</option>
        <option value="integration" ${sim === 'integration' ? 'selected' : ''}>Integration Diff + 2026 Trends</option>
      </select>
    </div>
    <div id="sim-container"></div>`;

  main.querySelector('#sim-select').onchange = (e) => {
    state.labSimulator = e.target.value;
    renderPatternLab();
  };
  renderSimulator(sim);
}

function renderSimulator(sim) {
  const container = document.getElementById('sim-container');
  switch (sim) {
    case 'react': renderReactSim(container); break;
    case 'topology': renderTopologySim(container); break;
    case 'langgraph': renderLangGraphSim(container); break;
    case 'rag': renderRagSim(container); break;
    case 'timeline': renderTimelineSim(container); break;
    case 'trace': renderTraceSim(container); break;
    case 'hitl': renderHitlSim(container); break;
    case 'integration': renderIntegrationSim(container); break;
  }
}

function renderReactSim(el) {
  const last = state.react.steps[state.react.steps.length - 1];
  el.innerHTML = `
    <div class="glass-card">
      <h3>ReAct Loop Stepper</h3>
      <label><input type="checkbox" id="reflection-toggle" ${state.react.reflectionEnabled ? 'checked' : ''} aria-label="Enable reflection critic"> Reflection critic</label>
      <div class="sim-display" id="react-display" aria-live="polite">${last ? last.text : 'Press Step to begin the Thought → Action → Observation cycle.'}</div>
      <div class="metrics-bar" id="react-metrics"></div>
      <button class="btn" id="react-step" aria-label="Step forward">Step Forward</button>
      <button class="btn btn-secondary" id="react-reset">Reset</button>
    </div>`;
  document.getElementById('reflection-toggle').onchange = (e) => {
    state.react = toggleReflection(state.react, e.target.checked);
    renderReactSim(el);
  };
  document.getElementById('react-step').onclick = () => {
    const { state: newState, display, metrics } = reactStep(state.react);
    state.react = newState;
    const displayEl = document.getElementById('react-display');
    displayEl.innerHTML = `<span class="pulse">${display}</span>`;
    if (metrics) {
      document.getElementById('react-metrics').innerHTML =
        `Latency: ${metrics.latency.toFixed(1)}s | Cost: $${metrics.cost.toFixed(2)} | Quality: ${(metrics.quality * 100).toFixed(0)}%`;
    }
    state.progress = recordActivity(state.progress);
  };
  document.getElementById('react-reset').onclick = () => {
    state.react = reactStep(state.react, 'reset').state;
    renderReactSim(el);
  };
}

function renderTopologySim(el) {
  const result = switchTopology(state.topology);
  el.innerHTML = `
    <div class="glass-card">
      <h3>Topology Switcher</h3>
      <div role="group" aria-label="Topology mode">
        ${getTopologyModes().map((m) => `<button class="btn ${m === state.topology ? '' : 'btn-secondary'}" data-topo="${m}">${m}</button>`).join('')}
      </div>
      <div class="tradeoff-panel" aria-label="Tradeoff panel">${result.tradeoffPanel}</div>
      <svg width="100%" height="200" aria-label="Topology graph" id="topo-svg">
        ${result.viz.nodes.map((n, i) => `<circle class="graph-node active" cx="${80 + i * 100}" cy="100" r="30" fill="#6366f1" stroke="#22d3ee"/><text x="${80 + i * 100}" y="105" text-anchor="middle" fill="white" font-size="10">${n.label.split(' ')[0]}</text>`).join('')}
        ${result.viz.edges.map((e, i) => `<line x1="110" y1="100" x2="180" y2="100" stroke="#22d3ee" stroke-width="2" class="flow-edge" style="animation: pulse 2s infinite"/>`).join('')}
      </svg>
      <p><strong>Flow:</strong> ${result.viz.flow.join(' → ')}</p>
    </div>`;
  el.querySelectorAll('[data-topo]').forEach((btn) => {
    btn.onclick = () => { state.topology = btn.dataset.topo; renderTopologySim(el); };
  });
}

function renderLangGraphSim(el) {
  const view = getLangGraphView();
  const step = stepLangGraph(state.langgraph);
  el.innerHTML = `
    <div class="glass-card">
      <h3>LangGraph State Viewer</h3>
      <p>${view.description}</p>
      <svg width="100%" height="120" aria-label="LangGraph">
        ${view.nodes.map((n, i) => `<g class="graph-node ${n.id === step.activeNode ? 'active' : ''} ${n.type === 'persistence' ? 'persistence' : ''} ${n.type === 'interrupt' ? 'interrupt' : ''}">
          <rect x="${i * 90 + 10}" y="40" width="70" height="40" rx="6" fill="#1a2332" stroke="${n.highlight ? '#f59e0b' : '#6366f1'}"/>
          <text x="${i * 90 + 45}" y="65" text-anchor="middle" fill="white" font-size="9">${n.label}</text>
        </g>`).join('')}
      </svg>
      <div class="sim-display" aria-live="polite">${step.message || 'Ready'}</div>
      <button class="btn" id="lg-step">Step Graph</button>
      <button class="btn btn-secondary" id="lg-reset">Reset</button>
    </div>`;
  document.getElementById('lg-step').onclick = () => {
    const r = stepLangGraph(state.langgraph);
    state.langgraph = r.state;
    renderLangGraphSim(el);
  };
  document.getElementById('lg-reset').onclick = () => { state.langgraph = { stepIndex: 0 }; renderLangGraphSim(el); };
}

function renderRagSim(el) {
  const result = simulateRagCascade(state.rag.mode, state.rag.failurePoint);
  el.innerHTML = `
    <div class="glass-card">
      <h3>Retrieval Failure Cascade</h3>
      <select id="rag-mode" aria-label="RAG mode">
        ${getRagModes().map((m) => `<option value="${m}" ${state.rag.mode === m ? 'selected' : ''}>${m}</option>`).join('')}
      </select>
      <select id="rag-fail" aria-label="Failure point">
        <option value="">No failure</option>
        <option value="vector_search">vector_search fail</option>
        <option value="graph_traverse">graph_traverse fail</option>
      </select>
      <div class="sim-display">${result.path.map((p) => `[${p.status.toUpperCase()}] ${p.step}: ${p.detail}`).join('\n')}</div>
      <p>${result.summary}</p>
    </div>`;
  document.getElementById('rag-mode').onchange = (e) => { state.rag.mode = e.target.value; renderRagSim(el); };
  document.getElementById('rag-fail').onchange = (e) => { state.rag.failurePoint = e.target.value || null; renderRagSim(el); };
}

function renderTimelineSim(el) {
  el.innerHTML = `
    <div class="glass-card">
      <h3>Checkpoint Timeline</h3>
      <div class="sim-display" id="tl-display">Phases: ${getPhases().map((p) => p.label).join(' → ')}</div>
      <button class="btn" id="tl-advance">Advance Phase</button>
      <button class="btn btn-secondary" id="tl-crash">Simulate Crash</button>
      <button class="btn" id="tl-resume">Resume from Checkpoint</button>
    </div>`;
  const update = (msg) => { document.getElementById('tl-display').textContent = msg; };
  document.getElementById('tl-advance').onclick = () => { const r = advanceTimeline(state.timeline); state.timeline = r.state; update(r.message); };
  document.getElementById('tl-crash').onclick = () => { const r = simulateCrash(state.timeline); state.timeline = r.state; update(r.message); };
  document.getElementById('tl-resume').onclick = () => { const r = simulateResume(state.timeline); state.timeline = r.state; update(r.message); };
}

function renderTraceSim(el) {
  const trace = getTrace();
  el.innerHTML = `
    <div class="glass-card">
      <h3>Trace Viewer</h3>
      <div class="sim-display">${trace.spans.map((s) => `${s.name} (${s.duration}ms) [${s.status}]`).join('\n')}</div>
      <h3>Failure Modes</h3>
      <ul>${getFailureModes().map((f) => `<li><strong>${f.risk}</strong> — ${f.mitigation}</li>`).join('')}</ul>
    </div>`;
}

function renderHitlSim(el) {
  const gates = getHitlGates();
  el.innerHTML = `
    <div class="glass-card">
      <h3>HITL / Guardrail Placement</h3>
      <div role="group" aria-label="HITL gates">
        ${gates.map((g) => `<button class="btn btn-secondary" data-gate="${g.id}" aria-label="Place ${g.label}">${g.label}</button>`).join('')}
      </div>
      <div id="hitl-checklist"></div>
    </div>`;
  el.querySelectorAll('[data-gate]').forEach((btn) => {
    btn.onclick = () => {
      const r = placeHitlGate(state.hitl, btn.dataset.gate);
      state.hitl = r.state;
      if (r.checklist) {
        document.getElementById('hitl-checklist').innerHTML = `<ul>${r.checklist.map((c) => `<li>${c.done ? '✓' : '○'} ${c.label}</li>`).join('')}</ul>`;
      }
    };
  });
}

function renderIntegrationSim(el) {
  const diff = getIntegrationDiff();
  el.innerHTML = `
    <div class="glass-card">
      <h3>Prototype → Enterprise Integration</h3>
      <table class="timeline-table"><thead><tr><th>Concern</th><th>Prototype</th><th>Enterprise</th></tr></thead>
        <tbody>${Object.keys(diff.prototype).map((k) => `<tr><td>${k}</td><td>${diff.prototype[k]}</td><td>${diff.enterprise[k]}</td></tr>`).join('')}</tbody>
      </table>
      <h3>2026 Trends</h3>
      ${diff.trends2026.map((t) => `<div class="tag">${t.title}: ${t.impact}</div>`).join('')}
    </div>`;
}

function stepCurrentSimulator() {
  if (state.labSimulator === 'react' || !state.labSimulator) {
    const { state: newState } = reactStep(state.react);
    state.react = newState;
  }
}

function renderWorkspace() {
  const w = state.workspace;
  const validation = validateSketch(w.sketch, w.wizard);
  main.innerHTML = `
    <h2>Architect Workspace</h2>
    <div class="glass-card">
      <h3>Capstone Templates</h3>
      ${CAPSTONES.map((c) => `<button class="btn btn-secondary" data-capstone="${c.id}">${c.name}</button>`).join('')}
    </div>
    <div class="workspace-layout">
      <div>
        <div class="node-palette" role="group" aria-label="Node palette">
          ${NODE_TYPES.map((t) => `<button class="palette-btn ${w.selectedNodeType === t ? 'selected' : ''}" data-node-type="${t}" aria-label="Add ${t}">${t}</button>`).join('')}
        </div>
        <p class="tag">Click canvas to place · Drag nodes to reposition · Select two nodes to connect</p>
        <div class="canvas-wrap" id="canvas-wrap" role="img" aria-label="Architecture canvas"></div>
        <button class="btn btn-secondary" id="connect-edge-btn">Connect Selected Nodes</button>
        <button class="btn btn-secondary" id="export-btn">Export Markdown + PNG</button>
      </div>
      <div class="glass-card">
        <h3>7-Step Wizard</h3>
        ${WIZARD_STEPS.map((step, i) => renderWizardField(step, i, w)).join('')}
        <div id="validation-status" class="${validation.complete ? 'checkpoint-result pass' : 'checkpoint-result fail'}" aria-live="polite">
          ${validation.complete ? 'Interview-ready structure ✓' : validation.errors.join('; ')}
        </div>
        <button class="btn" id="teach-back-btn">Start 8-min Teach-Back Timer</button>
        <span id="timer-display"></span>
      </div>
    </div>
    <div class="glass-card">
      <h3>Compare Sketches</h3>
      <button class="btn btn-secondary" id="save-compare">Save Current for Compare</button>
      <div class="compare-grid" id="compare-view"></div>
    </div>`;

  renderCanvas();
  main.querySelectorAll('[data-capstone]').forEach((btn) => {
    btn.onclick = () => {
      const cap = CAPSTONES.find((c) => c.id === btn.dataset.capstone);
      state.workspace.sketch = createSketch(cap.name, cap);
      state.workspace.wizard.scenario = cap.description;
      renderWorkspace();
    };
  });
  main.querySelectorAll('[data-node-type]').forEach((btn) => {
    btn.onclick = () => { state.workspace.selectedNodeType = btn.dataset.nodeType; renderWorkspace(); };
  });
  document.getElementById('connect-edge-btn').onclick = () => {
    const { edgeConnectFrom } = state.workspace;
    const selected = document.querySelector('.canvas-node.selected');
    if (!edgeConnectFrom || !selected) return;
    const toId = selected.dataset.nodeId;
    if (edgeConnectFrom !== toId) {
      state.workspace.sketch = addEdge(state.workspace.sketch, edgeConnectFrom, toId, 'flow');
      state.workspace.edgeConnectFrom = null;
      renderCanvas();
    }
  };
  document.getElementById('export-btn').onclick = () => exportWorkspace();
  document.getElementById('save-compare').onclick = () => {
    state.workspace.compareSketch = JSON.parse(JSON.stringify(state.workspace.sketch));
    const diff = compareSketches(state.workspace.compareSketch, state.workspace.sketch);
    document.getElementById('compare-view').innerHTML = `<div><pre>${diff.summary}</pre></div><div>${renderSketchSvg(state.workspace.sketch)}</div>`;
  };
  bindWizardInputs();
  document.getElementById('teach-back-btn').onclick = startTeachBackTimer;
}

function renderWizardField(step, i, w) {
  if (i === 0) return `<div class="wizard-step"><label>${step}</label><textarea data-wizard="scenario">${w.wizard.scenario}</textarea></div>`;
  if (i === 1) return `<div class="wizard-step"><label>${step}</label><p>${w.sketch.nodes.length} nodes, ${w.sketch.edges.length} edges</p><label>Annotations</label><textarea data-wizard="annotations" aria-label="Sketch annotations">${w.sketch.annotations || ''}</textarea></div>`;
  if (i === 2) return `<div class="wizard-step"><label>${step}</label><textarea data-wizard="justify">${w.wizard.justify}</textarea></div>`;
  if (i === 3) return `<div class="wizard-step"><label>${step}</label>${w.wizard.tradeoffs.map((t, j) => `<input type="text" data-wizard-tradeoff="${j}" value="${t}" placeholder="Tradeoff ${j + 1}">`).join('')}</div>`;
  if (i === 4) return `<div class="wizard-step"><label>${step}</label>${w.wizard.failures.map((f, j) => `<input type="text" data-wizard-fail-risk="${j}" value="${f.risk}" placeholder="Risk ${j + 1}"><input type="text" data-wizard-fail-mit="${j}" value="${f.mitigation}" placeholder="Mitigation">`).join('')}</div>`;
  if (i === 5) return `<div class="wizard-step"><label>${step}</label><textarea data-wizard="costLatency">${w.wizard.costLatency}</textarea></div>`;
  return `<div class="wizard-step"><label>${step}</label><p>Use the timer button below.</p></div>`;
}

function bindWizardInputs() {
  main.querySelector('[data-wizard="scenario"]')?.addEventListener('input', (e) => { state.workspace.wizard.scenario = e.target.value; });
  main.querySelector('[data-wizard="justify"]')?.addEventListener('input', (e) => { state.workspace.wizard.justify = e.target.value; });
  main.querySelector('[data-wizard="costLatency"]')?.addEventListener('input', (e) => { state.workspace.wizard.costLatency = e.target.value; });
  main.querySelector('[data-wizard="annotations"]')?.addEventListener('input', (e) => {
    state.workspace.sketch = setAnnotations(state.workspace.sketch, e.target.value);
  });
  main.querySelectorAll('[data-wizard-tradeoff]').forEach((el) => {
    el.addEventListener('input', (e) => { state.workspace.wizard.tradeoffs[+el.dataset.wizardTradeoff] = e.target.value; });
  });
  main.querySelectorAll('[data-wizard-fail-risk]').forEach((el) => {
    el.addEventListener('input', (e) => { state.workspace.wizard.failures[+el.dataset.wizardFailRisk].risk = e.target.value; });
  });
  main.querySelectorAll('[data-wizard-fail-mit]').forEach((el) => {
    el.addEventListener('input', (e) => { state.workspace.wizard.failures[+el.dataset.wizardFailMit].mitigation = e.target.value; });
  });
}

function renderCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  if (wrap) {
    wrap.innerHTML = renderSketchSvg(state.workspace.sketch);
    bindCanvasInteractions();
  }
}

function renderSketchSvg(sketch) {
  const colors = { Agent: '#6366f1', Tool: '#22d3ee', Memory: '#a78bfa', HITL: '#f59e0b', Guardrail: '#f87171', Router: '#34d399' };
  const nodeEls = sketch.nodes.map((n) =>
    `<g class="graph-node canvas-node" data-node-id="${n.id}" role="button" tabindex="0" aria-label="${n.type} ${n.label}">
      <rect class="node-rect" x="${n.x}" y="${n.y}" width="100" height="40" rx="8" fill="${colors[n.type] || '#6366f1'}" opacity="0.9"/>
      <text x="${n.x + 50}" y="${n.y + 25}" text-anchor="middle" fill="white" font-size="10" pointer-events="none">${n.label}</text>
    </g>`).join('');
  const edgeEls = sketch.edges.map((e) => {
    const from = sketch.nodes.find((n) => n.id === e.from);
    const to = sketch.nodes.find((n) => n.id === e.to);
    if (!from || !to) return '';
    return `<line x1="${from.x + 50}" y1="${from.y + 40}" x2="${to.x + 50}" y2="${to.y}" stroke="#22d3ee" stroke-width="2"/>`;
  }).join('');
  return `<svg class="workspace-svg" width="100%" height="400" viewBox="0 0 800 400" aria-label="Architecture sketch"><rect width="800" height="400" fill="#0a0e14" class="canvas-bg"/>${edgeEls}${nodeEls}</svg>`;
}

function bindCanvasInteractions() {
  const svg = document.querySelector('.workspace-svg');
  if (!svg) return;

  svg.querySelectorAll('.canvas-node').forEach((nodeEl) => {
    const nodeId = nodeEl.dataset.nodeId;
    nodeEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const n = state.workspace.sketch.nodes.find((x) => x.id === nodeId);
      if (!n) return;
      if (state.workspace.edgeConnectFrom && state.workspace.edgeConnectFrom !== nodeId) {
        nodeEl.classList.add('selected');
        return;
      }
      state.workspace.edgeConnectFrom = nodeId;
      svg.querySelectorAll('.canvas-node').forEach((el) => el.classList.remove('selected'));
      nodeEl.classList.add('selected');
      const rect = svg.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 400 / rect.height;
      state.workspace.drag = {
        nodeId,
        offsetX: (e.clientX - rect.left) * scaleX - n.x,
        offsetY: (e.clientY - rect.top) * scaleY - n.y,
      };
      nodeEl.setPointerCapture(e.pointerId);
    });
    nodeEl.addEventListener('pointermove', (e) => {
      if (state.workspace.drag.nodeId !== nodeId) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 400 / rect.height;
      const x = Math.max(0, Math.min(700, (e.clientX - rect.left) * scaleX - state.workspace.drag.offsetX));
      const y = Math.max(0, Math.min(360, (e.clientY - rect.top) * scaleY - state.workspace.drag.offsetY));
      state.workspace.sketch = moveNode(state.workspace.sketch, nodeId, x, y);
      const rectEl = nodeEl.querySelector('.node-rect');
      const textEl = nodeEl.querySelector('text');
      rectEl.setAttribute('x', x);
      rectEl.setAttribute('y', y);
      textEl.setAttribute('x', x + 50);
      textEl.setAttribute('y', y + 25);
      renderCanvasEdges(svg);
    });
    nodeEl.addEventListener('pointerup', () => {
      state.workspace.drag = { nodeId: null, offsetX: 0, offsetY: 0 };
    });
  });

  svg.querySelector('.canvas-bg')?.addEventListener('click', (e) => {
    const rect = svg.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 400 / rect.height;
    const x = (e.clientX - rect.left) * scaleX - 50;
    const y = (e.clientY - rect.top) * scaleY - 20;
    state.workspace.sketch = addNode(
      state.workspace.sketch,
      state.workspace.selectedNodeType,
      state.workspace.selectedNodeType,
      Math.max(0, Math.min(700, x)),
      Math.max(0, Math.min(360, y)),
    );
    renderCanvas();
  });
}

function renderCanvasEdges(svg) {
  const sketch = state.workspace.sketch;
  svg.querySelectorAll('line').forEach((l) => l.remove());
  sketch.edges.forEach((e) => {
    const from = sketch.nodes.find((n) => n.id === e.from);
    const to = sketch.nodes.find((n) => n.id === e.to);
    if (!from || !to) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x + 50);
    line.setAttribute('y1', from.y + 40);
    line.setAttribute('x2', to.x + 50);
    line.setAttribute('y2', to.y);
    line.setAttribute('stroke', '#22d3ee');
    line.setAttribute('stroke-width', '2');
    svg.insertBefore(line, svg.querySelector('.canvas-node'));
  });
}

async function exportWorkspace() {
  const md = generateExport(state.workspace.sketch, state.workspace.wizard);
  const blob = new Blob([md], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${state.workspace.sketch.name || 'architecture'}.md`;
  a.click();
  const svg = renderSketchSvg(state.workspace.sketch);
  const pngDataUrl = await rasterizeSvgToPng(svg, 800, 400);
  const img = document.createElement('a');
  img.href = pngDataUrl;
  img.download = `${state.workspace.sketch.name || 'architecture'}.png`;
  img.click();
  state.progress.sketches.push({ ...state.workspace.sketch, exportedAt: Date.now() });
  saveProgress(state.progress);
}

function startTeachBackTimer() {
  let remaining = 8 * 60;
  const display = document.getElementById('timer-display');
  const interval = setInterval(() => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    display.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    if (--remaining < 0) {
      clearInterval(interval);
      state.workspace.wizard.teachBackCompleted = true;
      display.textContent = 'Teach-back complete!';
    }
  }, 1000);
}

function renderResources() {
  main.innerHTML = `
    <h2>Resources</h2>
    <div class="glass-card">
      <h3>Written Resources</h3>
      <ul>${RESOURCES.written.map((r) => `<li><strong>${r.title}</strong> — ${r.author}</li>`).join('')}</ul>
    </div>
    <div class="glass-card">
      <h3>Podcasts (Car Listening)</h3>
      ${RESOURCES.podcasts.map((p) => `
        <div class="wizard-step">
          <strong>${p.title}</strong> — ${p.host}
          <div>${p.conceptBookmarks.map((b) => `<span class="tag">${b.label} @ ${b.time}</span>`).join('')}</div>
          <audio controls aria-label="${p.title} audio player" style="width:100%;margin-top:0.5rem">
            <source src="" type="audio/mpeg">
            <p>Audio stub — link to podcast externally. Bookmarks show concept sync points.</p>
          </audio>
        </div>`).join('')}
    </div>`;
}

function renderReview() {
  const review = computeReviewItems(state.progress);
  main.innerHTML = `
    <h2>Review Mode</h2>
    <div class="glass-card">
      <p>Day ${review.daysSinceStart} of your journey. Spaced review on Days 3, 7, 14.</p>
      ${review.items.length ? review.items.map((item) => `
        <div class="review-nudge">
          <strong>${item.type === 'checkpoint' ? 'Checkpoint' : 'Sketch'} review</strong>
          <p>Due since Day ${item.dueDay}</p>
        </div>`).join('') : '<p>No reviews due yet. Keep practicing!</p>'}
      <button class="btn" id="reshsketch">Re-sketch Challenge (Week 1)</button>
    </div>`;
  document.getElementById('reshsketch')?.addEventListener('click', () => {
    state.workspace.sketch = createSketch('Re-sketch Challenge');
    state.view = 'workspace';
    render();
  });
}

init();