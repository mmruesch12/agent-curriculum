const TOPOLOGIES = {
  supervisor: {
    name: 'Supervisor / Orchestrator-Worker',
    nodes: [
      { id: 'sup', label: 'Supervisor', role: 'orchestrator' },
      { id: 'w1', label: 'Research Worker', role: 'worker' },
      { id: 'w2', label: 'Code Worker', role: 'worker' },
      { id: 'w3', label: 'Review Worker', role: 'worker' },
    ],
    edges: [
      { from: 'sup', to: 'w1', parallel: false },
      { from: 'sup', to: 'w2', parallel: false },
      { from: 'sup', to: 'w3', parallel: false },
    ],
    flow: ['Supervisor receives task', 'Delegates to specialized worker', 'Worker returns result', 'Supervisor synthesizes'],
    tradeoffs: {
      complexity: 'medium',
      latency: 'sequential — higher',
      isolation: 'high — workers are isolated',
      coordination: 'centralized — easy to govern',
    },
  },
  router: {
    name: 'Router + Parallel Dispatch',
    nodes: [
      { id: 'router', label: 'Router', role: 'router' },
      { id: 'a1', label: 'Agent A', role: 'agent' },
      { id: 'a2', label: 'Agent B', role: 'agent' },
      { id: 'syn', label: 'Synthesizer', role: 'synthesizer' },
    ],
    edges: [
      { from: 'router', to: 'a1', parallel: true },
      { from: 'router', to: 'a2', parallel: true },
      { from: 'a1', to: 'syn', parallel: false },
      { from: 'a2', to: 'syn', parallel: false },
    ],
    flow: ['Router classifies intent', 'Parallel dispatch to agents', 'Synthesizer merges results'],
    tradeoffs: {
      complexity: 'medium-high',
      latency: 'parallel — lower',
      isolation: 'medium — shared router context',
      coordination: 'decentralized synthesis step',
    },
  },
  handoffs: {
    name: 'State-driven Handoffs',
    nodes: [
      { id: 'req', label: 'Requirements Agent', role: 'agent' },
      { id: 'des', label: 'Design Agent', role: 'agent' },
      { id: 'cod', label: 'Code Agent', role: 'agent' },
      { id: 'rev', label: 'Review Agent', role: 'agent' },
    ],
    edges: [
      { from: 'req', to: 'des', parallel: false },
      { from: 'des', to: 'cod', parallel: false },
      { from: 'cod', to: 'rev', parallel: false },
    ],
    flow: ['Agent completes phase', 'State handoff to next agent', 'Next agent resumes with context'],
    tradeoffs: {
      complexity: 'high — state handoff management',
      latency: 'sequential — phase-gated',
      isolation: 'high per phase',
      coordination: 'state synchronization required',
    },
  },
  skills: {
    name: 'Single Agent with Skills',
    nodes: [{ id: 'agent', label: 'Unified Agent', role: 'agent' }],
    skills: ['research_skill', 'code_skill', 'review_skill'],
    edges: [],
    flow: ['Agent selects skill dynamically', 'Executes within shared context', 'No inter-agent handoff'],
    tradeoffs: {
      complexity: 'low',
      latency: 'lowest — no delegation overhead',
      isolation: 'low — shared context window',
      coordination: 'none — simplest to operate',
    },
  },
};

/** Compute node positions and edge paths for SVG rendering from topology graph. */
export function computeTopologyLayout(topology) {
  const nodes = topology.nodes || [];
  const edges = topology.edges || [];
  const width = 520;
  const height = 220;
  const positions = {};

  if (nodes.length === 1) {
    positions[nodes[0].id] = { x: width / 2, y: height / 2, label: nodes[0].label };
  } else if (topology.skills?.length) {
    positions[nodes[0].id] = { x: width / 2, y: height / 2 - 20, label: nodes[0].label };
  } else {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    nodes.forEach((n, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      positions[n.id] = {
        x: 70 + col * (width - 140) / Math.max(cols - 1, 1),
        y: 50 + row * ((height - 100) / Math.max(Math.ceil(nodes.length / cols) - 1, 1)),
        label: n.label,
      };
    });
  }

  const edgePaths = edges.map((e) => {
    const from = positions[e.from];
    const to = positions[e.to];
    if (!from || !to) return null;
    return {
      from: e.from,
      to: e.to,
      parallel: e.parallel,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
    };
  }).filter(Boolean);

  return { positions, edgePaths, skills: topology.skills || [], width, height };
}

export function switchTopology(mode) {
  const topology = TOPOLOGIES[mode];
  if (!topology) throw new Error(`Unknown topology: ${mode}`);
  const layout = computeTopologyLayout(topology);
  return {
    mode,
    topology,
    tradeoffPanel: formatTradeoffPanel(topology.tradeoffs),
    metrics: {
      nodeCount: topology.nodes.length,
      edgeCount: (topology.edges || []).length,
      parallelEdges: (topology.edges || []).filter((e) => e.parallel).length,
    },
    viz: {
      nodes: topology.nodes,
      edges: topology.edges || [],
      skills: topology.skills || [],
      flow: topology.flow,
      layout,
    },
  };
}

export function getTopologyModes() {
  return Object.keys(TOPOLOGIES);
}

function formatTradeoffPanel(tradeoffs) {
  return Object.entries(tradeoffs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}