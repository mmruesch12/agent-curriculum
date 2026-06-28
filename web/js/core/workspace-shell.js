import {
  setWizardField,
  loadCapstone,
  selectNodeForEdge,
  placeNode,
  resetSketch,
} from './workspace-controller.js';
import { validateSketch } from './validators.js';
import { generateExport } from './export.js';

/** Same mutation path used by app.js bindWizardInputs → applyWizardInput */
export function applyWizardInput(workspace, key, value) {
  return setWizardField(workspace, key, value);
}

/** Same validation path used by app.js updateWorkspaceSidebar */
export function getWorkspaceChromeState(workspace) {
  const validation = validateSketch(workspace.sketch, workspace.wizard);
  return {
    countLabel: `${workspace.sketch.nodes.length} nodes, ${workspace.sketch.edges.length} edges`,
    statusText: validation.complete ? 'Interview-ready structure ✓' : validation.errors.join('; '),
    complete: validation.complete,
    errors: validation.errors,
  };
}

/** Capstone load → connect two nodes by label → full wizard (UI listener sequence) */
export function runCapstoneConnectWizardFlow(workspace, capstone, fromLabel, toLabel, wizardData) {
  let ws = loadCapstone(workspace, capstone);
  const fromNode = ws.sketch.nodes.find((n) => n.label === fromLabel);
  const toNode = ws.sketch.nodes.find((n) => n.label === toLabel);
  if (!fromNode || !toNode) {
    throw new Error(`Capstone nodes not found: ${fromLabel}, ${toLabel}`);
  }
  const edgesBefore = ws.sketch.edges.length;
  ws = selectNodeForEdge(ws, fromNode.id);
  ws = selectNodeForEdge(ws, toNode.id);
  const edgesAfter = ws.sketch.edges.length;
  const edgeAdded = edgesAfter === edgesBefore + 1;
  const newEdge = ws.sketch.edges.find((e) => e.from === fromNode.id && e.to === toNode.id);

  ws = applyWizardInput(ws, 'scenario', wizardData.scenario);
  ws = applyWizardInput(ws, 'justify', wizardData.justify);
  ws = applyWizardInput(ws, 'annotations', wizardData.annotations || '');
  wizardData.tradeoffs.forEach((t, i) => { ws = applyWizardInput(ws, `tradeoff:${i}`, t); });
  wizardData.failures.forEach((f, i) => {
    ws = applyWizardInput(ws, `fail-risk:${i}`, f.risk);
    ws = applyWizardInput(ws, `fail-mit:${i}`, f.mitigation);
  });
  ws = applyWizardInput(ws, 'costLatency', wizardData.costLatency);

  const chrome = getWorkspaceChromeState(ws);
  const md = generateExport(ws.sketch, ws.wizard);

  return {
    workspace: ws,
    edgeAdded,
    edgesBefore,
    edgesAfter,
    newEdge,
    chrome,
    md,
  };
}