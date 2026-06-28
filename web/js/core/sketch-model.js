import { NODE_TYPES } from '../data/curriculum.js';

export function createSketch(name = 'Untitled', template = null) {
  return {
    id: `sketch-${Date.now()}`,
    name,
    createdAt: Date.now(),
    nodes: template ? template.nodes.map((n) => ({ ...n })) : [],
    edges: template ? template.edges.map((e) => ({ ...e })) : [],
    annotations: '',
  };
}

export function addNode(sketch, type, label, x, y) {
  if (!NODE_TYPES.includes(type)) throw new Error(`Invalid node type: ${type}`);
  const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    ...sketch,
    nodes: [...sketch.nodes, { id, type, label: label || type, x, y }],
  };
}

export function moveNode(sketch, nodeId, x, y) {
  return {
    ...sketch,
    nodes: sketch.nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
  };
}

export function setAnnotations(sketch, annotations) {
  return { ...sketch, annotations };
}

export function addEdge(sketch, fromId, toId, label = '') {
  return {
    ...sketch,
    edges: [...sketch.edges, { from: fromId, to: toId, label }],
  };
}

export function compareSketches(a, b) {
  const typesA = new Set(a.nodes.map((n) => n.type));
  const typesB = new Set(b.nodes.map((n) => n.type));
  const missingInB = [...typesA].filter((t) => !typesB.has(t));
  const missingInA = [...typesB].filter((t) => !typesA.has(t));
  const nodeCountDiff = Math.abs(a.nodes.length - b.nodes.length);
  return {
    missingInB,
    missingInA,
    nodeCountDiff,
    edgeCountDiff: Math.abs(a.edges.length - b.edges.length),
    summary:
      missingInB.length || missingInA.length
        ? `Structural diff: missing types in B: [${missingInB.join(', ')}]; in A: [${missingInA.join(', ')}]`
        : 'Sketches have matching node type coverage.',
  };
}