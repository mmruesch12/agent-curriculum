export function getLangGraphView() {
  return {
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
      { from: 'plan', to: 'execute', conditional: true, label: 'tools needed' },
      { from: 'execute', to: 'checkpoint', conditional: false },
      { from: 'checkpoint', to: 'hitl', conditional: true, label: 'high risk' },
      { from: 'hitl', to: 'reflect', conditional: false },
      { from: 'reflect', to: 'end', conditional: true, label: 'done' },
    ],
    highlights: {
      persistence: ['checkpoint'],
      interrupts: ['hitl'],
    },
    description:
      'Stateful graph with conditional routing. Checkpoint node persists state; HITL interrupt pauses for human approval before continuing.',
  };
}

export function stepLangGraph(state) {
  const view = getLangGraphView();
  const order = ['start', 'plan', 'execute', 'checkpoint', 'hitl', 'reflect', 'end'];
  const idx = state.stepIndex ?? 0;
  if (idx >= order.length) {
    return { state: { ...state, complete: true }, activeNode: 'end', message: 'Graph execution complete.' };
  }
  const activeNode = order[idx];
  const node = view.nodes.find((n) => n.id === activeNode);
  return {
    state: { stepIndex: idx + 1, complete: idx + 1 >= order.length },
    activeNode,
    message: `Executing node: ${node.label}${node.highlight ? ' [highlighted]' : ''}`,
    isPersistence: node.type === 'persistence',
    isInterrupt: node.type === 'interrupt',
  };
}