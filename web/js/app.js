import { MODULES, CAPSTONES, TIMELINE, RESOURCES, WIZARD_STEPS, NODE_TYPES } from './data/curriculum.js';
import { createReactState, reactStep, toggleReflection, getReactScenarios } from './core/react-simulator.js';
import { switchTopology, getTopologyModes } from './core/topology-simulator.js';
import { getLangGraphView, stepLangGraph, resetLangGraph, getLangGraphDisplay } from './core/langgraph-simulator.js';
import { simulateRagCascade, getRagModes, getRagFailurePoints } from './core/rag-simulator.js';
import { createTimelineState, advanceTimeline, simulateCrash, simulateResume, getPhases } from './core/checkpoint-timeline.js';
import { getTrace, selectSpan, injectFailureMode, createTraceState, getFailureModes } from './core/trace-simulator.js';
import { createHitlState, placeHitlGate, getHitlGates } from './core/hitl-simulator.js';
import { getIntegrationDiff } from './core/integration-simulator.js';
import { compareSketches } from './core/sketch-model.js';
import { renderSketchSvg } from './core/sketch-render.js';
import { validateSketch } from './core/validators.js';
import { generateExport, rasterizeSvgToPng } from './core/export.js';
import {
  createDefaultWorkspace,
  loadCapstone,
  resetSketch,
  clearCanvas,
  deleteSelectedNode,
  deleteLastEdge,
  setSelectedNodeType,
  placeNode,
  moveNodeOnCanvas,
  selectNodeForEdge,
  selectCanvasNode,
  setDragState,
  saveCompareSketch,
} from './core/workspace-controller.js';
import { applyWizardInput, getWorkspaceChromeState } from './core/workspace-shell.js';
import { loadProgress, saveProgress, recordActivity, markModuleComplete, computeModuleRings, computeReviewItems } from './core/progress.js';
import { evaluateCheckpoint } from './core/checkpoints.js';
import { escapeHtml, showToast } from './core/dom-utils.js';

const state = {
  view: 'dashboard',
  progress: loadProgress(),
  moduleId: 1,
  react: createReactState(false),
  topology: 'supervisor',
  langgraph: resetLangGraph(),
  rag: { mode: 'vector', failurePoint: null },
  timeline: createTimelineState(),
  trace: createTraceState(),
  hitl: createHitlState(),
  workspace: createDefaultWorkspace(),
  resourceSearch: '',
  sidebarCollapsed: false,
};

const main = document.getElementById('main-content');
const reviewNudges = document.getElementById('review-nudges');

function init() {
  state.progress = recordActivity(state.progress);
  bindNav();
  bindSidebarToggle();
  render();
  document.addEventListener('keydown', handleGlobalKeys);
}

function bindSidebarToggle() {
  const btn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    btn.setAttribute('aria-expanded', String(!state.sidebarCollapsed));
  });
}

function bindNav() {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      if (state.view === 'modules' && !state.moduleId) state.moduleId = 1;
      document.querySelectorAll('.nav-link').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
      render();
      main.focus();
    });
  });
}

function handleGlobalKeys(e) {
  if (e.key === 's' && e.ctrlKey && state.view === 'pattern-lab') {
    e.preventDefault();
    stepCurrentSimulator();
  }
  if (e.key === 'Delete' && state.view === 'workspace' && state.workspace.selectedNodeId) {
    e.preventDefault();
    state.workspace = deleteSelectedNode(state.workspace);
    syncWorkspaceChrome();
    showToast('Node deleted', 'info');
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
  const rings = computeModuleRings(state.progress);
  const review = computeReviewItems(state.progress);
  main.innerHTML = `
    <div class="page-header"><h2>Dashboard</h2><span class="badge">Day ${review.daysSinceStart || 1}</span></div>
    <div class="dashboard-stats">
      <div class="stat-card"><div class="stat-value">${rings.completed}</div><div class="stat-label">Modules complete</div></div>
      <div class="stat-card"><div class="stat-value">${rings.percent}%</div><div class="stat-label">Progress</div></div>
      <div class="stat-card"><div class="stat-value">${state.progress.streak.count}</div><div class="stat-label">Day streak</div></div>
      <div class="stat-card"><div class="stat-value">${review.items.length}</div><div class="stat-label">Reviews due</div></div>
    </div>
    <div class="glass-card">
      <h3>Your Learning Journey</h3>
      <p>14–22 hours over 7–14 days. Breadth-first interview prep for production enterprise AI agents.</p>
      <table class="timeline-table" aria-label="Suggested timeline">
        <thead><tr><th>Days</th><th>Focus</th><th>Hours</th></tr></thead>
        <tbody>${TIMELINE.map((t) => `<tr><td>${escapeHtml(t.days)}</td><td>${escapeHtml(t.focus)}</td><td>${escapeHtml(t.hours)}</td></tr>`).join('')}</tbody>
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
  const completed = state.progress.moduleCompletion?.[mod.id];
  main.innerHTML = `
    <div class="page-header">
      <h2>Module ${mod.id}: ${escapeHtml(mod.title)}</h2>
      ${completed ? '<span class="badge tag success">Complete</span>' : '<span class="badge">In progress</span>'}
    </div>
    <div class="module-grid" role="navigation" aria-label="Module navigation">
      ${MODULES.map((m) => {
        const done = state.progress.moduleCompletion?.[m.id];
        return `<button class="module-card ${m.id === mod.id ? 'active' : ''} ${done ? 'done' : ''}" data-mod="${m.id}" aria-label="Module ${m.id}">
          <div class="mod-num">Module ${m.id}</div>
          <div class="mod-title">${escapeHtml(m.title)}</div>
        </button>`;
      }).join('')}
    </div>
    <div class="glass-card">
      <h3>Objectives</h3>
      <ul>${mod.objectives.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
      <h3>Key Topics</h3>
      <div>${mod.lingo.map((l) => `<span class="tag" title="${escapeHtml(l)}">${escapeHtml(l)}</span>`).join('')}</div>
      <h3>Active Practice</h3>
      <ul>${mod.practice.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
    </div>
    <div class="glass-card">
      <h3>Checkpoints</h3>
      <p class="tag hint">Answers need 3+ key concepts, 60+ characters, and 12+ words of reasoning.</p>
      ${mod.checkpoints.map((cp, i) => {
        const saved = state.progress.checkpointAnswers?.[`m${mod.id}-cp${i}`];
        return `
        <div class="wizard-step" data-cp="${i}">
          <label>${escapeHtml(cp.question)}</label>
          <p class="tag hint">Key concepts: ${cp.keywords.slice(0, 5).join(', ')}…</p>
          <textarea aria-label="Checkpoint answer ${i + 1}" data-cp-input="${i}" placeholder="Explain your reasoning with enterprise context…">${saved?.answer || ''}</textarea>
          <button class="btn" data-cp-submit="${i}">Submit</button>
          <div class="checkpoint-result ${saved?.result?.pass ? 'pass' : saved?.result ? 'fail' : ''}" id="cp-result-${i}" aria-live="polite">${saved?.result?.feedback || ''}</div>
        </div>`;
      }).join('')}
    </div>
    <div>
      <button class="btn btn-secondary" data-prev ${mod.id <= 1 ? 'disabled' : ''}>← Previous</button>
      <button class="btn" data-next ${mod.id >= 9 ? 'disabled' : ''}>Next Module →</button>
      <button class="btn btn-secondary" data-goto-sim>Open Simulator</button>
    </div>`;

  main.querySelectorAll('[data-mod]').forEach((btn) => {
    btn.onclick = () => { state.moduleId = Number(btn.dataset.mod); render(); };
  });

  mod.checkpoints.forEach((cp, i) => {
    const textarea = main.querySelector(`[data-cp-input="${i}"]`);
    textarea?.addEventListener('input', () => {
      const words = textarea.value.trim().split(/\s+/).filter(Boolean).length;
      const chars = textarea.value.trim().length;
      textarea.setAttribute('aria-describedby', `cp-metrics-${i}`);
      let metrics = main.querySelector(`#cp-metrics-${i}`);
      if (!metrics) {
        metrics = document.createElement('div');
        metrics.id = `cp-metrics-${i}`;
        metrics.className = 'checkpoint-metrics';
        textarea.parentElement.appendChild(metrics);
      }
      metrics.innerHTML = `<span class="tag">${words} words</span><span class="tag">${chars} chars</span>`;
    });
    textarea?.dispatchEvent(new Event('input'));

    main.querySelector(`[data-cp-submit="${i}"]`).onclick = () => {
      const answer = textarea.value;
      const result = evaluateCheckpoint(answer, cp);
      const el = document.getElementById(`cp-result-${i}`);
      el.className = `checkpoint-result ${result.pass ? 'pass' : 'fail'}`;
      el.textContent = result.feedback;
      state.progress.checkpointAnswers[`m${mod.id}-cp${i}`] = { answer, result, timestamp: Date.now() };
      if (result.pass) {
        state.progress = markModuleComplete(state.progress, mod.id);
        saveProgress(state.progress);
        showToast(`Module ${mod.id} checkpoint passed`, 'success');
      } else {
        showToast('Add more depth and key concepts', 'error');
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
      <p class="tag hint">Tip: Ctrl+S steps ReAct forward</p>
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
  const scenarios = getReactScenarios();
  el.innerHTML = `
    <div class="glass-card">
      <h3>ReAct Loop Stepper</h3>
      <label for="react-scenario">Scenario</label>
      <select id="react-scenario" aria-label="ReAct scenario">
        ${scenarios.map((s) => `<option value="${s.id}" ${state.react.scenarioId === s.id ? 'selected' : ''}>${escapeHtml(s.label)} (${s.stepCount} steps)</option>`).join('')}
      </select>
      <label><input type="checkbox" id="reflection-toggle" ${state.react.reflectionEnabled ? 'checked' : ''} aria-label="Enable reflection critic"> Reflection critic</label>
      <div class="sim-display" id="react-display" aria-live="polite">${last ? escapeHtml(last.text) : 'Press Step to begin the Thought → Action → Observation cycle.'}</div>
      <div class="metrics-bar" id="react-metrics"></div>
      <button class="btn" id="react-step" aria-label="Step forward">Step Forward</button>
      <button class="btn btn-secondary" id="react-reset">Reset</button>
    </div>`;
  document.getElementById('react-scenario').onchange = (e) => {
    const r = reactStep(state.react, 'setScenario', e.target.value);
    state.react = r.state;
    renderReactSim(el);
    showToast(r.display, 'info');
  };
  document.getElementById('reflection-toggle').onchange = (e) => {
    state.react = toggleReflection(state.react, e.target.checked);
    renderReactSim(el);
  };
  document.getElementById('react-step').onclick = () => {
    const { state: newState, display, metrics } = reactStep(state.react);
    state.react = newState;
    const displayEl = document.getElementById('react-display');
    displayEl.innerHTML = `<span class="pulse">${escapeHtml(display)}</span>`;
    if (metrics) {
      document.getElementById('react-metrics').innerHTML = `
        <span class="metric-chip">Phase: ${metrics.phase}</span>
        <span class="metric-chip">Latency: ${metrics.latency.toFixed(1)}s</span>
        <span class="metric-chip">Cost: $${metrics.cost.toFixed(2)}</span>
        <span class="metric-chip">Quality: ${(metrics.quality * 100).toFixed(0)}%</span>`;
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
  const { layout } = result.viz;
  const nodeEls = Object.entries(layout.positions).map(([id, pos]) =>
    `<circle class="graph-node active" cx="${pos.x}" cy="${pos.y}" r="22" fill="#6366f1" stroke="#22d3ee" stroke-width="2"/>
     <text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" fill="white" font-size="8">${escapeHtml(pos.label.split(' ')[0])}</text>`,
  ).join('');
  const edgeEls = layout.edgePaths.map((e) =>
    `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.parallel ? '#f59e0b' : '#22d3ee'}" stroke-width="${e.parallel ? 3 : 2}" stroke-dasharray="${e.parallel ? '6 3' : 'none'}"/>`,
  ).join('');
  el.innerHTML = `
    <div class="glass-card">
      <h3>${escapeHtml(result.topology.name)}</h3>
      <div role="group" aria-label="Topology mode">
        ${getTopologyModes().map((m) => `<button class="btn btn-sm ${m === state.topology ? '' : 'btn-secondary'}" data-topo="${m}">${m}</button>`).join('')}
      </div>
      <div class="metrics-bar">
        <span class="metric-chip">${result.metrics.nodeCount} nodes</span>
        <span class="metric-chip">${result.metrics.edgeCount} edges</span>
        <span class="metric-chip">${result.metrics.parallelEdges} parallel</span>
      </div>
      <div class="tradeoff-panel" aria-label="Tradeoff panel">${escapeHtml(result.tradeoffPanel)}</div>
      <svg class="topo-svg" viewBox="0 0 ${layout.width} ${layout.height}" aria-label="Topology graph" id="topo-svg">${edgeEls}${nodeEls}</svg>
      ${layout.skills.length ? `<p><strong>Skills:</strong> ${layout.skills.map((s) => `<span class="tag">${s}</span>`).join('')}</p>` : ''}
      <p><strong>Flow:</strong> ${result.viz.flow.map(escapeHtml).join(' → ')}</p>
    </div>`;
  el.querySelectorAll('[data-topo]').forEach((btn) => {
    btn.onclick = () => { state.topology = btn.dataset.topo; renderTopologySim(el); };
  });
}

function renderLangGraphSim(el) {
  const view = getLangGraphView();
  const display = getLangGraphDisplay(state.langgraph);
  el.innerHTML = `
    <div class="glass-card">
      <h3>LangGraph State Viewer</h3>
      <p>${escapeHtml(view.description)}</p>
      <svg width="100%" height="120" aria-label="LangGraph">
        ${view.nodes.map((n, i) => `<g class="graph-node ${n.id === display.activeNode ? 'active' : ''} ${n.type === 'persistence' ? 'persistence' : ''} ${n.type === 'interrupt' ? 'interrupt' : ''}">
          <rect x="${i * 90 + 10}" y="40" width="70" height="40" rx="6" fill="#1a2332" stroke="${n.highlight ? '#f59e0b' : '#6366f1'}"/>
          <text x="${i * 90 + 45}" y="65" text-anchor="middle" fill="white" font-size="9">${escapeHtml(n.label)}</text>
        </g>`).join('')}
      </svg>
      <div class="sim-display" id="lg-display" aria-live="polite">${escapeHtml(display.message || 'Ready')}</div>
      ${display.branches?.length ? `<div class="branch-group" role="group" aria-label="Branch choices">
        ${display.branches.map((b) => `<button class="btn btn-sm btn-secondary" data-branch="${b.branch}">${escapeHtml(b.label)}</button>`).join('')}
      </div>` : ''}
      <button class="btn" id="lg-step">Step Graph</button>
      <button class="btn btn-secondary" id="lg-reset">Reset</button>
    </div>`;
  el.querySelectorAll('[data-branch]').forEach((btn) => {
    btn.onclick = () => {
      const r = stepLangGraph(state.langgraph, btn.dataset.branch);
      state.langgraph = r.state;
      renderLangGraphSim(el);
    };
  });
  document.getElementById('lg-step').onclick = () => {
    const r = stepLangGraph(state.langgraph);
    state.langgraph = r.state;
    renderLangGraphSim(el);
  };
  document.getElementById('lg-reset').onclick = () => { state.langgraph = resetLangGraph(); renderLangGraphSim(el); };
}

function renderRagSim(el) {
  const result = simulateRagCascade(state.rag.mode, state.rag.failurePoint);
  const failPoints = getRagFailurePoints(state.rag.mode);
  el.innerHTML = `
    <div class="glass-card">
      <h3>Retrieval Failure Cascade</h3>
      <select id="rag-mode" aria-label="RAG mode">
        ${getRagModes().map((m) => `<option value="${m}" ${state.rag.mode === m ? 'selected' : ''}>${m}</option>`).join('')}
      </select>
      <select id="rag-fail" aria-label="Failure point">
        <option value="">No failure (healthy)</option>
        ${failPoints.map((fp) => `<option value="${fp}" ${state.rag.failurePoint === fp ? 'selected' : ''}>${fp} fail</option>`).join('')}
      </select>
      <div class="metrics-bar">
        <span class="metric-chip">${result.failureCount} failures/cascades</span>
        ${result.failurePoint ? `<span class="metric-chip warn">Root: ${result.failurePoint}</span>` : ''}
      </div>
      <div class="sim-display">${result.path.map((p) => `[${p.status.toUpperCase()}] ${p.step}: ${p.detail}`).join('\n')}</div>
      <p class="tag hint">${escapeHtml(result.recoveryHint)}</p>
      <p>${escapeHtml(result.summary)}</p>
    </div>`;
  document.getElementById('rag-mode').onchange = (e) => { state.rag.mode = e.target.value; state.rag.failurePoint = null; renderRagSim(el); };
  document.getElementById('rag-fail').onchange = (e) => { state.rag.failurePoint = e.target.value || null; renderRagSim(el); };
}

function renderTimelineSim(el) {
  const tl = state.timeline;
  el.innerHTML = `
    <div class="glass-card">
      <h3>Checkpoint Timeline</h3>
      <div class="sim-display" id="tl-display">
Phases: ${getPhases().map((p) => p.label).join(' → ')}
Checkpoints saved: ${tl.checkpoints.length}
Status: ${tl.crashed ? 'CRASHED' : tl.resumed ? 'RESUMED' : 'Running'}
      </div>
      <button class="btn" id="tl-advance">Advance Phase</button>
      <button class="btn btn-secondary" id="tl-crash">Simulate Crash</button>
      <button class="btn" id="tl-resume">Resume from Checkpoint</button>
      <button class="btn btn-secondary" id="tl-reset">Reset Timeline</button>
    </div>`;
  const update = (msg) => { document.getElementById('tl-display').textContent = msg; };
  document.getElementById('tl-advance').onclick = () => { const r = advanceTimeline(state.timeline); state.timeline = r.state; update(r.message); };
  document.getElementById('tl-crash').onclick = () => { const r = simulateCrash(state.timeline); state.timeline = r.state; update(r.message); showToast('Crash simulated', 'error'); };
  document.getElementById('tl-resume').onclick = () => { const r = simulateResume(state.timeline); state.timeline = r.state; update(r.message); showToast(r.resumed ? 'Resumed from checkpoint' : 'No checkpoint', r.resumed ? 'success' : 'error'); };
  document.getElementById('tl-reset').onclick = () => { state.timeline = createTimelineState(); renderTimelineSim(el); };
}

function renderTraceSim(el) {
  const trace = getTrace();
  const selected = state.trace.selectedSpanId;
  const expanded = selected ? selectSpan(state.trace, selected).expanded : null;
  el.innerHTML = `
    <div class="glass-card">
      <h3>Trace Viewer</h3>
      <ul class="span-list" role="listbox" aria-label="Trace spans">
        ${trace.spans.map((s) => `<li class="${s.status === 'error' ? 'error' : ''} ${selected === s.id ? 'selected' : ''}" data-span="${s.id}" role="option">${s.name} (${s.duration}ms) [${s.status}]</li>`).join('')}
      </ul>
      <div class="sim-display" id="span-detail" aria-live="polite">${expanded ? `${expanded.span.name}: ${expanded.totalDuration}ms total, ${expanded.children.length} children, error=${expanded.hasError}` : 'Click a span to expand'}</div>
      <h3>Failure Modes (inject)</h3>
      <div role="group" aria-label="Failure injection">
        ${getFailureModes().map((f) => `<button class="btn btn-sm btn-secondary" data-fail="${f.id}">${escapeHtml(f.risk)}</button>`).join('')}
      </div>
      <div id="fail-detail" class="tag hint"></div>
    </div>`;
  el.querySelectorAll('[data-span]').forEach((li) => {
    li.onclick = () => {
      const r = selectSpan(state.trace, li.dataset.span);
      state.trace = r.state;
      renderTraceSim(el);
    };
  });
  el.querySelectorAll('[data-fail]').forEach((btn) => {
    btn.onclick = () => {
      const r = injectFailureMode(state.trace, btn.dataset.fail);
      state.trace = r.state;
      document.getElementById('fail-detail').textContent = r.message;
      showToast(r.injected ? `Injected: ${r.injected.risk}` : 'Unknown failure', 'info');
    };
  });
}

function renderHitlSim(el) {
  const gates = getHitlGates();
  const placed = state.hitl.placed || [];
  el.innerHTML = `
    <div class="glass-card">
      <h3>HITL / Guardrail Placement</h3>
      <p class="tag">${placed.length} gates placed · ${placed.filter((id) => gates.find((g) => g.id === id)?.leverage === 'high').length} high-leverage</p>
      <div role="group" aria-label="HITL gates">
        ${gates.map((g) => `<button class="btn btn-sm ${placed.includes(g.id) ? 'btn-success' : 'btn-secondary'}" data-gate="${g.id}" aria-label="Place ${g.label}">${escapeHtml(g.label)}</button>`).join('')}
      </div>
      <div id="hitl-checklist"></div>
      <button class="btn btn-secondary" id="hitl-reset">Reset Gates</button>
    </div>`;
  if (placed.length) {
    const r = placeHitlGate(state.hitl, placed[placed.length - 1]);
    if (r.checklist) {
      document.getElementById('hitl-checklist').innerHTML = `<ul>${r.checklist.map((c) => `<li>${c.done ? '✓' : '○'} ${escapeHtml(c.label)}</li>`).join('')}</ul>`;
    }
  }
  el.querySelectorAll('[data-gate]').forEach((btn) => {
    btn.onclick = () => {
      const r = placeHitlGate(state.hitl, btn.dataset.gate);
      if (r.error) { showToast(r.error, 'error'); return; }
      state.hitl = r.state;
      renderHitlSim(el);
      showToast(`Placed: ${r.gate.label}`, 'success');
    };
  });
  document.getElementById('hitl-reset').onclick = () => { state.hitl = createHitlState(); renderHitlSim(el); };
}

function renderIntegrationSim(el) {
  const diff = getIntegrationDiff();
  el.innerHTML = `
    <div class="glass-card">
      <h3>Prototype → Enterprise Integration</h3>
      <table class="timeline-table"><thead><tr><th>Concern</th><th>Prototype</th><th>Enterprise</th></tr></thead>
        <tbody>${Object.keys(diff.prototype).map((k) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(diff.prototype[k])}</td><td>${escapeHtml(diff.enterprise[k])}</td></tr>`).join('')}</tbody>
      </table>
      <h3>2026 Trends</h3>
      ${diff.trends2026.map((t) => `<div class="tag">${escapeHtml(t.title)}: ${escapeHtml(t.impact)}</div>`).join('')}
    </div>`;
}

function stepCurrentSimulator() {
  if (state.labSimulator === 'react' || !state.labSimulator) {
    const { state: newState } = reactStep(state.react);
    state.react = newState;
    renderPatternLab();
  }
}

function renderWorkspace() {
  const w = state.workspace;
  const validation = validateSketch(w.sketch, w.wizard);
  main.innerHTML = `
    <h2>Architect Workspace</h2>
    <div class="glass-card">
      <h3>Capstone Templates</h3>
      ${CAPSTONES.map((c) => `<button class="btn btn-secondary" data-capstone="${c.id}">${escapeHtml(c.name)}</button>`).join('')}
    </div>
    <div class="workspace-layout">
      <div>
        <div class="node-palette" role="group" aria-label="Node palette">
          ${NODE_TYPES.map((t) => `<button class="palette-btn ${w.selectedNodeType === t ? 'selected' : ''}" data-node-type="${t}" aria-label="Add ${t}">${t}</button>`).join('')}
        </div>
        <div class="canvas-toolbar">
          <span class="tag hint">Click canvas to place · Drag to move · Click two nodes to connect · Del to delete selected</span>
          <button class="btn btn-sm btn-danger" id="delete-node" ${!w.selectedNodeId ? 'disabled' : ''}>Delete Node</button>
          <button class="btn btn-sm btn-secondary" id="delete-edge" ${!w.sketch.edges.length ? 'disabled' : ''}>Undo Last Edge</button>
          <button class="btn btn-sm btn-secondary" id="clear-canvas">Clear Canvas</button>
        </div>
        <p id="edge-hint" class="tag" aria-live="polite"></p>
        <div class="canvas-wrap" id="canvas-wrap" role="img" aria-label="Architecture canvas 800 by 400"></div>
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
      state.workspace = loadCapstone(state.workspace, cap);
      renderWorkspace();
      showToast(`Loaded: ${cap.name}`, 'success');
    };
  });
  main.querySelectorAll('[data-node-type]').forEach((btn) => {
    btn.onclick = () => {
      state.workspace = setSelectedNodeType(state.workspace, btn.dataset.nodeType);
      renderWorkspace();
    };
  });
  document.getElementById('delete-node').onclick = () => {
    state.workspace = deleteSelectedNode(state.workspace);
    syncWorkspaceChrome();
    showToast('Node deleted', 'info');
  };
  document.getElementById('delete-edge').onclick = () => {
    state.workspace = deleteLastEdge(state.workspace);
    syncWorkspaceChrome();
    showToast('Last edge removed', 'info');
  };
  document.getElementById('clear-canvas').onclick = () => {
    state.workspace = clearCanvas(state.workspace);
    syncWorkspaceChrome();
    showToast('Canvas cleared', 'info');
  };
  document.getElementById('export-btn').onclick = () => exportWorkspace();
  updateEdgeHint();
  document.getElementById('save-compare').onclick = () => {
    state.workspace = saveCompareSketch(state.workspace);
    const diff = compareSketches(state.workspace.compareSketch, state.workspace.sketch);
    document.getElementById('compare-view').innerHTML = `<div><pre>${escapeHtml(diff.summary)}</pre></div><div>${renderSketchSvg(state.workspace.sketch)}</div>`;
    showToast('Sketch saved for compare', 'success');
  };
  bindWizardInputs();
  document.getElementById('teach-back-btn').onclick = startTeachBackTimer;
}

function renderWizardField(step, i, w) {
  if (i === 0) return `<div class="wizard-step"><label>${escapeHtml(step)}</label><textarea data-wizard="scenario">${escapeHtml(w.wizard.scenario)}</textarea></div>`;
  if (i === 1) return `<div class="wizard-step"><label>${escapeHtml(step)}</label><p data-sketch-count>${w.sketch.nodes.length} nodes, ${w.sketch.edges.length} edges</p><label>Annotations</label><textarea data-wizard="annotations" aria-label="Sketch annotations">${escapeHtml(w.sketch.annotations || '')}</textarea></div>`;
  if (i === 2) return `<div class="wizard-step"><label>${escapeHtml(step)}</label><textarea data-wizard="justify">${escapeHtml(w.wizard.justify)}</textarea></div>`;
  if (i === 3) return `<div class="wizard-step"><label>${escapeHtml(step)}</label>${w.wizard.tradeoffs.map((t, j) => `<input type="text" data-wizard-tradeoff="${j}" value="${escapeHtml(t)}" placeholder="Tradeoff ${j + 1}">`).join('')}</div>`;
  if (i === 4) return `<div class="wizard-step"><label>${escapeHtml(step)}</label>${w.wizard.failures.map((f, j) => `<input type="text" data-wizard-fail-risk="${j}" value="${escapeHtml(f.risk)}" placeholder="Risk ${j + 1}"><input type="text" data-wizard-fail-mit="${j}" value="${escapeHtml(f.mitigation)}" placeholder="Mitigation">`).join('')}</div>`;
  if (i === 5) return `<div class="wizard-step"><label>${escapeHtml(step)}</label><textarea data-wizard="costLatency">${escapeHtml(w.wizard.costLatency)}</textarea></div>`;
  return `<div class="wizard-step"><label>${escapeHtml(step)}</label><p>Use the timer button below.</p></div>`;
}

function bindWizardInputs() {
  main.querySelector('[data-wizard="scenario"]')?.addEventListener('input', (e) => {
    state.workspace = applyWizardInput(state.workspace, 'scenario', e.target.value);
    syncWorkspaceChrome();
  });
  main.querySelector('[data-wizard="justify"]')?.addEventListener('input', (e) => {
    state.workspace = applyWizardInput(state.workspace, 'justify', e.target.value);
    syncWorkspaceChrome();
  });
  main.querySelector('[data-wizard="costLatency"]')?.addEventListener('input', (e) => {
    state.workspace = applyWizardInput(state.workspace, 'costLatency', e.target.value);
    syncWorkspaceChrome();
  });
  main.querySelector('[data-wizard="annotations"]')?.addEventListener('input', (e) => {
    state.workspace = applyWizardInput(state.workspace, 'annotations', e.target.value);
    syncWorkspaceChrome();
  });
  main.querySelectorAll('[data-wizard-tradeoff]').forEach((el) => {
    el.addEventListener('input', () => {
      state.workspace = applyWizardInput(state.workspace, `tradeoff:${el.dataset.wizardTradeoff}`, el.value);
      syncWorkspaceChrome();
    });
  });
  main.querySelectorAll('[data-wizard-fail-risk]').forEach((el) => {
    el.addEventListener('input', () => {
      state.workspace = applyWizardInput(state.workspace, `fail-risk:${el.dataset.wizardFailRisk}`, el.value);
      syncWorkspaceChrome();
    });
  });
  main.querySelectorAll('[data-wizard-fail-mit]').forEach((el) => {
    el.addEventListener('input', () => {
      state.workspace = applyWizardInput(state.workspace, `fail-mit:${el.dataset.wizardFailMit}`, el.value);
      syncWorkspaceChrome();
    });
  });
}

function updateWorkspaceSidebar() {
  const chrome = getWorkspaceChromeState(state.workspace);
  const countEl = main.querySelector('[data-sketch-count]');
  if (countEl) countEl.textContent = chrome.countLabel;
  const status = document.getElementById('validation-status');
  if (status) {
    status.className = chrome.complete ? 'checkpoint-result pass' : 'checkpoint-result fail';
    status.textContent = chrome.statusText;
  }
  const delBtn = document.getElementById('delete-node');
  if (delBtn) delBtn.disabled = !state.workspace.selectedNodeId;
  const edgeBtn = document.getElementById('delete-edge');
  if (edgeBtn) edgeBtn.disabled = !state.workspace.sketch.edges.length;
  updateEdgeHint();
}

function updateEdgeHint() {
  const hint = document.getElementById('edge-hint');
  if (!hint) return;
  const first = state.workspace.edgeSelection.first;
  const sel = state.workspace.selectedNodeId;
  if (first) {
    hint.textContent = 'First node selected — click a second node to connect';
    hint.className = 'tag warn';
  } else if (sel) {
    const node = state.workspace.sketch.nodes.find((n) => n.id === sel);
    hint.textContent = node ? `Selected: ${node.label} (${node.type}) — press Delete or use toolbar` : '';
    hint.className = 'tag';
  } else {
    hint.textContent = '';
  }
}

function syncWorkspaceChrome() {
  renderCanvas();
  updateWorkspaceSidebar();
}

function renderCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  if (wrap) {
    const highlightId = state.workspace.edgeSelection.first || state.workspace.selectedNodeId;
    wrap.innerHTML = renderSketchSvg(state.workspace.sketch, highlightId);
    if (state.workspace.selectedNodeId && !state.workspace.edgeSelection.first) {
      const sel = wrap.querySelector(`[data-node-id="${state.workspace.selectedNodeId}"]`);
      sel?.classList.add('selected-node');
    }
    bindCanvasInteractions();
  }
}

function bindCanvasInteractions() {
  const svg = document.querySelector('.workspace-svg');
  if (!svg) return;
  const DRAG_THRESHOLD = 5;

  svg.querySelectorAll('.canvas-node').forEach((nodeEl) => {
    const nodeId = nodeEl.dataset.nodeId;
    const pointer = { down: false, moved: false, startX: 0, startY: 0 };

    nodeEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      pointer.down = true;
      pointer.moved = false;
      pointer.startX = e.clientX;
      pointer.startY = e.clientY;
      const n = state.workspace.sketch.nodes.find((x) => x.id === nodeId);
      if (!n) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 400 / rect.height;
      state.workspace = setDragState(state.workspace, {
        nodeId,
        offsetX: (e.clientX - rect.left) * scaleX - n.x,
        offsetY: (e.clientY - rect.top) * scaleY - n.y,
      });
      nodeEl.setPointerCapture(e.pointerId);
    });

    nodeEl.addEventListener('pointermove', (e) => {
      if (!pointer.down) return;
      if (Math.hypot(e.clientX - pointer.startX, e.clientY - pointer.startY) > DRAG_THRESHOLD) {
        pointer.moved = true;
      }
      if (!pointer.moved || state.workspace.drag.nodeId !== nodeId) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 400 / rect.height;
      const x = Math.max(0, Math.min(700, (e.clientX - rect.left) * scaleX - state.workspace.drag.offsetX));
      const y = Math.max(0, Math.min(360, (e.clientY - rect.top) * scaleY - state.workspace.drag.offsetY));
      state.workspace = moveNodeOnCanvas(state.workspace, nodeId, x, y);
      const moved = state.workspace.sketch.nodes.find((n) => n.id === nodeId);
      if (!moved) return;
      const rectEl = nodeEl.querySelector('.node-rect');
      const texts = nodeEl.querySelectorAll('text');
      rectEl.setAttribute('x', moved.x);
      rectEl.setAttribute('y', moved.y);
      if (texts[0]) { texts[0].setAttribute('x', moved.x + 50); texts[0].setAttribute('y', moved.y + 18); }
      if (texts[1]) { texts[1].setAttribute('x', moved.x + 50); texts[1].setAttribute('y', moved.y + 32); }
      renderCanvasEdges(svg);
    });

    nodeEl.addEventListener('pointerup', () => {
      if (pointer.down && !pointer.moved) {
        state.workspace = selectNodeForEdge(state.workspace, nodeId);
        state.workspace = selectCanvasNode(state.workspace, nodeId);
        syncWorkspaceChrome();
      }
      pointer.down = false;
      pointer.moved = false;
      state.workspace = setDragState(state.workspace, { nodeId: null, offsetX: 0, offsetY: 0 });
    });
  });

  svg.querySelector('.canvas-bg')?.addEventListener('click', (e) => {
    if (e.target !== svg.querySelector('.canvas-bg')) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 400 / rect.height;
    const x = (e.clientX - rect.left) * scaleX - 50;
    const y = (e.clientY - rect.top) * scaleY - 20;
    state.workspace = placeNode(
      state.workspace,
      state.workspace.selectedNodeType,
      Math.max(0, Math.min(700, x)),
      Math.max(0, Math.min(360, y)),
    );
    syncWorkspaceChrome();
    showToast(`Placed ${state.workspace.selectedNodeType}`, 'info');
  });
}

function renderCanvasEdges(svg) {
  const sketch = state.workspace.sketch;
  svg.querySelectorAll('.edge-group, line').forEach((l) => l.remove());
  const defs = svg.querySelector('defs') || (() => {
    const d = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    d.innerHTML = '<marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee"/></marker>';
    svg.insertBefore(d, svg.firstChild);
    return d;
  })();
  void defs;
  sketch.edges.forEach((e) => {
    const from = sketch.nodes.find((n) => n.id === e.from);
    const to = sketch.nodes.find((n) => n.id === e.to);
    if (!from || !to) return;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'edge-group');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x + 50);
    line.setAttribute('y1', from.y + 40);
    line.setAttribute('x2', to.x + 50);
    line.setAttribute('y2', to.y);
    line.setAttribute('stroke', '#22d3ee');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrow)');
    g.appendChild(line);
    if (e.label) {
      const midX = (from.x + 50 + to.x + 50) / 2;
      const midY = (from.y + 40 + to.y) / 2;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX);
      text.setAttribute('y', midY - 4);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#8b9cb3');
      text.setAttribute('font-size', '9');
      text.textContent = e.label;
      g.appendChild(text);
    }
    const firstNode = svg.querySelector('.canvas-node');
    svg.insertBefore(g, firstNode);
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
  showToast('Exported Markdown + PNG', 'success');
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
      state.workspace = applyWizardInput(state.workspace, 'teachBackCompleted', true);
      syncWorkspaceChrome();
      display.textContent = 'Teach-back complete!';
      showToast('Teach-back complete', 'success');
    }
  }, 1000);
}

function renderResources() {
  const q = state.resourceSearch.toLowerCase();
  main.innerHTML = `
    <h2>Resources</h2>
    <div class="search-bar">
      <input type="text" id="resource-search" placeholder="Search resources…" aria-label="Search resources" value="${escapeHtml(state.resourceSearch)}">
    </div>
    <div class="glass-card">
      <h3>Written Resources</h3>
      <ul id="written-list">${RESOURCES.written.map((r) => {
        const text = `${r.title} ${r.author}`.toLowerCase();
        const hidden = q && !text.includes(q);
        return `<li class="resource-item ${hidden ? 'hidden-by-search' : ''}"><strong>${escapeHtml(r.title)}</strong> — ${escapeHtml(r.author)}</li>`;
      }).join('')}</ul>
    </div>
    <div class="glass-card">
      <h3>Podcasts (Car Listening)</h3>
      ${RESOURCES.podcasts.map((p) => {
        const text = `${p.title} ${p.host}`.toLowerCase();
        const hidden = q && !text.includes(q);
        return `
        <div class="resource-item ${hidden ? 'hidden-by-search' : ''}">
          <strong>${escapeHtml(p.title)}</strong> — ${escapeHtml(p.host)}
          <div>${p.conceptBookmarks.map((b) => `<span class="tag">${escapeHtml(b.label)} @ ${escapeHtml(b.time)}</span>`).join('')}</div>
          <audio controls aria-label="${escapeHtml(p.title)} audio player" style="width:100%;margin-top:0.5rem">
            <source src="" type="audio/mpeg">
            <p>Audio stub — link to podcast externally. Bookmarks show concept sync points.</p>
          </audio>
        </div>`;
      }).join('')}
    </div>`;
  document.getElementById('resource-search').addEventListener('input', (e) => {
    state.resourceSearch = e.target.value;
    renderResources();
  });
}

function renderReview() {
  const review = computeReviewItems(state.progress);
  const checkpointCount = Object.keys(state.progress.checkpointAnswers || {}).length;
  main.innerHTML = `
    <h2>Review Mode</h2>
    <div class="glass-card">
      <div class="dashboard-stats">
        <div class="stat-card"><div class="stat-value">${review.daysSinceStart}</div><div class="stat-label">Days active</div></div>
        <div class="stat-card"><div class="stat-value">${checkpointCount}</div><div class="stat-label">Checkpoints answered</div></div>
        <div class="stat-card"><div class="stat-value">${review.items.length}</div><div class="stat-label">Due now</div></div>
      </div>
      <p>Spaced review on Days 3, 7, 14.</p>
      ${review.items.length ? review.items.map((item) => `
        <div class="review-card review-nudge">
          <strong>${item.type === 'checkpoint' ? 'Checkpoint' : 'Sketch'} review</strong>
          <p>Due since Day ${item.dueDay}</p>
          ${item.type === 'checkpoint' ? '<button class="btn btn-sm" data-goto-modules>Review modules</button>' : '<button class="btn btn-sm" data-goto-workspace>Open workspace</button>'}
        </div>`).join('') : '<p>No reviews due yet. Keep practicing!</p>'}
      <button class="btn" id="reshsketch">Re-sketch Challenge (Week 1)</button>
      <button class="btn btn-secondary" id="reset-progress">Reset Progress</button>
    </div>`;
  document.getElementById('reshsketch')?.addEventListener('click', () => {
    state.workspace = resetSketch(state.workspace, 'Re-sketch Challenge');
    state.view = 'workspace';
    render();
    showToast('Re-sketch challenge loaded', 'info');
  });
  document.getElementById('reset-progress')?.addEventListener('click', () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      localStorage.removeItem('aaa-progress');
      state.progress = loadProgress();
      render();
      showToast('Progress reset', 'info');
    }
  });
  main.querySelector('[data-goto-modules]')?.addEventListener('click', () => { state.view = 'modules'; render(); });
  main.querySelector('[data-goto-workspace]')?.addEventListener('click', () => { state.view = 'workspace'; render(); });
}

window.__AAA = {
  generateMd: () => generateExport(state.workspace.sketch, state.workspace.wizard),
  runExport: async () => {
    const svg = renderSketchSvg(state.workspace.sketch);
    const png = await rasterizeSvgToPng(svg, 800, 400);
    const md = generateExport(state.workspace.sketch, state.workspace.wizard);
    return {
      pngPrefix: png.slice(0, 22),
      mdSections: (md.match(/^## \d/gm) || []).length,
      nodes: state.workspace.sketch.nodes.length,
      edges: state.workspace.sketch.edges.length,
      hasAnnotations: Boolean(state.workspace.sketch.annotations),
      md,
    };
  },
};

init();