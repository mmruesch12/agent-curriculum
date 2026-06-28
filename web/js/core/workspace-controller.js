import { createSketch, addNode, moveNode, setAnnotations } from './sketch-model.js';

export function createDefaultWorkspace() {
  return {
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
    edgeSelection: { first: null },
    drag: { nodeId: null, offsetX: 0, offsetY: 0 },
  };
}

function cloneSketch(sketch) {
  return {
    ...sketch,
    nodes: sketch.nodes.map((n) => ({ ...n })),
    edges: sketch.edges.map((e) => ({ ...e })),
    annotations: sketch.annotations ?? '',
  };
}

function cloneWorkspace(ws) {
  return {
    ...ws,
    sketch: cloneSketch(ws.sketch),
    wizard: {
      ...ws.wizard,
      tradeoffs: [...ws.wizard.tradeoffs],
      failures: ws.wizard.failures.map((f) => ({ ...f })),
    },
    edgeSelection: { ...ws.edgeSelection },
    drag: { ...ws.drag },
  };
}

function clearEdgeSelection(ws) {
  return { ...ws, edgeSelection: { first: null } };
}

function nodeExists(sketch, nodeId) {
  return sketch.nodes.some((n) => n.id === nodeId);
}

/** Add edge only when both endpoints exist in the current sketch. */
export function addValidatedEdge(sketch, fromId, toId, label = '') {
  if (!nodeExists(sketch, fromId) || !nodeExists(sketch, toId)) {
    return sketch;
  }
  if (fromId === toId) return sketch;
  const duplicate = sketch.edges.some((e) => e.from === fromId && e.to === toId);
  if (duplicate) return sketch;
  return {
    ...sketch,
    edges: [...sketch.edges, { from: fromId, to: toId, label }],
  };
}

export function loadCapstone(workspace, capstone) {
  const ws = cloneWorkspace(workspace);
  ws.sketch = createSketch(capstone.name, capstone);
  ws.wizard = { ...ws.wizard, scenario: capstone.description };
  ws.edgeSelection = { first: null };
  return ws;
}

export function resetSketch(workspace, name = 'Re-sketch Challenge') {
  const ws = cloneWorkspace(workspace);
  ws.sketch = createSketch(name);
  ws.edgeSelection = { first: null };
  return ws;
}

export function setSelectedNodeType(workspace, nodeType) {
  return { ...cloneWorkspace(workspace), selectedNodeType: nodeType };
}

export function setWizardField(workspace, key, value) {
  const ws = cloneWorkspace(workspace);
  if (key === 'scenario' || key === 'justify' || key === 'costLatency') {
    ws.wizard[key] = value;
  } else if (key === 'annotations') {
    ws.sketch = setAnnotations(ws.sketch, value);
  } else if (key.startsWith('tradeoff:')) {
    const idx = Number(key.split(':')[1]);
    ws.wizard.tradeoffs[idx] = value;
  } else if (key.startsWith('fail-risk:')) {
    const idx = Number(key.split(':')[1]);
    ws.wizard.failures[idx] = { ...ws.wizard.failures[idx], risk: value };
  } else if (key.startsWith('fail-mit:')) {
    const idx = Number(key.split(':')[1]);
    ws.wizard.failures[idx] = { ...ws.wizard.failures[idx], mitigation: value };
  } else if (key === 'teachBackCompleted') {
    ws.wizard.teachBackCompleted = Boolean(value);
  }
  return ws;
}

export function placeNode(workspace, type, x, y, label = type) {
  const ws = clearEdgeSelection(cloneWorkspace(workspace));
  ws.sketch = addNode(ws.sketch, type, label, x, y);
  return ws;
}

export function moveNodeOnCanvas(workspace, nodeId, x, y) {
  const ws = cloneWorkspace(workspace);
  if (!nodeExists(ws.sketch, nodeId)) return clearEdgeSelection(ws);
  ws.sketch = moveNode(ws.sketch, nodeId, x, y);
  return ws;
}

export function selectNodeForEdge(workspace, nodeId) {
  const ws = cloneWorkspace(workspace);
  if (!nodeExists(ws.sketch, nodeId)) {
    return clearEdgeSelection(ws);
  }
  const first = ws.edgeSelection.first;
  if (!first) {
    return { ...ws, edgeSelection: { first: nodeId } };
  }
  if (first === nodeId) {
    return clearEdgeSelection(ws);
  }
  const updatedSketch = addValidatedEdge(ws.sketch, first, nodeId, 'flow');
  return {
    ...ws,
    sketch: updatedSketch,
    edgeSelection: { first: null },
  };
}

export function connectNodes(workspace, fromId, toId) {
  const ws = cloneWorkspace(workspace);
  ws.sketch = addValidatedEdge(ws.sketch, fromId, toId, 'flow');
  ws.edgeSelection = { first: null };
  return ws;
}

export function setDragState(workspace, drag) {
  return { ...cloneWorkspace(workspace), drag: { ...drag } };
}

export function saveCompareSketch(workspace) {
  const ws = cloneWorkspace(workspace);
  ws.compareSketch = JSON.parse(JSON.stringify(ws.sketch));
  return ws;
}