const GRAPH = {
  nodes: [
    { id: 'start', label: 'START', type: 'entry' },
    { id: 'plan', label: 'Plan', type: 'node' },
    { id: 'execute', label: 'Execute Tools', type: 'node' },
    { id: 'hitl', label: 'HITL Interrupt', type: 'interrupt', highlight: true },
    { id: 'checkpoint', label: 'Checkpoint', type: 'persistence', highlight: true },
    { id: 'reflect', label: 'Reflect', type: 'node' },
    { id: 'end', label: 'END', type: 'exit' },
  ],
  edges: [
    { from: 'start', to: 'plan', conditional: false },
    { from: 'plan', to: 'execute', conditional: true, label: 'tools needed', branch: 'tools' },
    { from: 'plan', to: 'reflect', conditional: true, label: 'no tools', branch: 'direct' },
    { from: 'execute', to: 'checkpoint', conditional: false },
    { from: 'checkpoint', to: 'hitl', conditional: true, label: 'high risk', branch: 'risk' },
    { from: 'checkpoint', to: 'reflect', conditional: true, label: 'low risk', branch: 'skip_hitl' },
    { from: 'hitl', to: 'reflect', conditional: false },
    { from: 'reflect', to: 'end', conditional: true, label: 'done' },
  ],
};

export function getLangGraphView() {
  return {
    nodes: GRAPH.nodes,
    edges: GRAPH.edges,
    highlights: {
      persistence: ['checkpoint'],
      interrupts: ['hitl'],
    },
    description:
      'Stateful graph with conditional routing. Checkpoint node persists state; HITL interrupt pauses for human approval before continuing.',
  };
}

export function getLangGraphBranches(nodeId) {
  return GRAPH.edges
    .filter((e) => e.from === nodeId && e.conditional)
    .map((e) => ({ branch: e.branch, label: e.label, to: e.to }));
}

export function stepLangGraph(state, branchChoice = null) {
  const view = getLangGraphView();
  const current = state.currentNode || 'start';
  const node = view.nodes.find((n) => n.id === current);

  if (state.complete) {
    return { state, activeNode: 'end', message: 'Graph execution complete.', path: state.path || [] };
  }

  const outgoing = GRAPH.edges.filter((e) => e.from === current);
  let nextEdge = outgoing.find((e) => !e.conditional);
  if (!nextEdge && branchChoice) {
    nextEdge = outgoing.find((e) => e.branch === branchChoice) || outgoing[0];
  } else if (!nextEdge && outgoing.length === 1) {
    nextEdge = outgoing[0];
  }

  const path = [...(state.path || []), current];
  const branches = getLangGraphBranches(current);

  if (branches.length > 0 && !branchChoice) {
    return {
      state: { ...state, currentNode: current, awaitingBranch: true, path },
      activeNode: current,
      message: `At ${node.label}: choose branch — ${branches.map((b) => b.label).join(' or ')}`,
      branches,
      isPersistence: node.type === 'persistence',
      isInterrupt: node.type === 'interrupt',
    };
  }

  const nextNode = nextEdge?.to || 'end';
  const nextNodeDef = view.nodes.find((n) => n.id === nextNode);
  const complete = nextNode === 'end';

  return {
    state: {
      currentNode: nextNode,
      stepIndex: (state.stepIndex ?? 0) + 1,
      complete,
      awaitingBranch: false,
      path: [...path, nextNode],
      lastBranch: branchChoice,
    },
    activeNode: nextNode,
    message: `Transitioned to ${nextNodeDef?.label || nextNode}${nextNodeDef?.highlight ? ' [highlighted]' : ''}`,
    branches: getLangGraphBranches(nextNode),
    isPersistence: nextNodeDef?.type === 'persistence',
    isInterrupt: nextNodeDef?.type === 'interrupt',
  };
}

export function resetLangGraph() {
  return { stepIndex: 0, currentNode: 'start', complete: false, awaitingBranch: false, path: [] };
}