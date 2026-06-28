const GATE_OPTIONS = [
  { id: 'pre-tool', label: 'Pre-tool execution', leverage: 'high', x: 100, y: 80 },
  { id: 'pre-deploy', label: 'Pre-deployment', leverage: 'high', x: 280, y: 80 },
  { id: 'post-generate', label: 'Post-generation review', leverage: 'medium', x: 100, y: 200 },
  { id: 'financial', label: 'Financial transaction', leverage: 'high', x: 280, y: 200 },
];

export function getHitlGates() {
  return GATE_OPTIONS;
}

export function placeHitlGate(state, gateId) {
  const gate = GATE_OPTIONS.find((g) => g.id === gateId);
  if (!gate) return { state, error: 'Unknown gate' };
  if (state.placed.includes(gateId)) return { state, error: 'Already placed' };
  const placed = [...state.placed, gateId];
  const checklist = buildGovernanceChecklist(placed);
  return {
    state: { placed },
    gate,
    checklist,
    complete: placed.filter((id) => GATE_OPTIONS.find((g) => g.id === id)?.leverage === 'high').length >= 2,
  };
}

export function createHitlState() {
  return { placed: [] };
}

function buildGovernanceChecklist(placed) {
  const items = [
    { id: 'audit', label: 'Audit logging enabled', done: placed.length > 0 },
    { id: 'rbac', label: 'RBAC on approval gates', done: placed.includes('financial') || placed.includes('pre-deploy') },
    { id: 'policy', label: 'Policy engine on outputs', done: placed.includes('post-generate') },
    { id: 'lineage', label: 'Data lineage tracked', done: placed.length >= 2 },
  ];
  return items;
}