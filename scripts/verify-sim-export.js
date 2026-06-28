#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createReactState, reactStep } from '../web/js/core/react-simulator.js';
import { switchTopology } from '../web/js/core/topology-simulator.js';
import { createDefaultWorkspace } from '../web/js/core/workspace-controller.js';
import { runCapstoneConnectWizardFlow } from '../web/js/core/workspace-shell.js';
import { CAPSTONES, WIZARD_STEPS } from '../web/js/data/curriculum.js';

const SCRATCH = process.env.SCRATCH || '/var/folders/h5/777kg7xs0d3345cjkktl8qxc0000gn/T/grok-goal-8af6a0b5e05f/implementer';
mkdirSync(SCRATCH, { recursive: true });

const lines = [];

let s = createReactState(true);
for (let i = 0; i < 8; i++) {
  const r = reactStep(s, 'advance');
  s = r.state;
  if (r.display) lines.push('--- ReAct step ---', r.display);
}

const topo = switchTopology('supervisor');
lines.push('--- Topology tradeoffs ---', topo.tradeoffPanel);

const wizard = {
  scenario: 'Governed internal development agent for enterprise platform team',
  justify: 'Supervisor pattern with HITL gates for modularity and governance',
  annotations: 'HITL before external deploy actions',
  tradeoffs: [
    'Latency vs quality: reflection adds tokens',
    'Cost vs control: more HITL gates slow flow',
    'Simplicity vs specialization: fewer agents easier to operate',
  ],
  failures: [
    { risk: 'Cascading tool errors', mitigation: 'Circuit breaker with fallback tools' },
    { risk: 'State drift across handoffs', mitigation: 'Schema-validated checkpoints' },
    { risk: 'Retrieval quality collapse', mitigation: 'Hybrid search with reranking' },
    { risk: 'Prompt injection via tools', mitigation: 'Input guardrails and sandboxed tools' },
    { risk: 'Eval blind spots on workflow', mitigation: 'End-to-end trace outcome metrics' },
  ],
  costLatency: 'Model routing to smaller models for routing; semantic cache for repeated queries',
};

const capstoneResult = runCapstoneConnectWizardFlow(
  createDefaultWorkspace(),
  CAPSTONES[0],
  'GraphRAG Retriever',
  'Session Memory',
  wizard,
);

lines.push('--- Capstone connect flow ---', `edgeAdded=${capstoneResult.edgeAdded} edges=${capstoneResult.edgesBefore}->${capstoneResult.edgesAfter}`);
lines.push('--- Chrome state ---', capstoneResult.chrome.statusText);
lines.push('--- Full export ---', capstoneResult.md);

WIZARD_STEPS.forEach((step) => {
  if (!capstoneResult.md.includes(step)) throw new Error(`Export missing: ${step}`);
});
if (!capstoneResult.edgeAdded) throw new Error('Capstone connect did not add edge');
if (!capstoneResult.md.includes('n2 → n3')) throw new Error('Export missing new edge n2 → n3');

writeFileSync(join(SCRATCH, 'sim-and-export.txt'), lines.join('\n'));
writeFileSync(join(SCRATCH, 'sim-export-full.md'), capstoneResult.md);
console.log(`Wrote sim-and-export.txt (edgeAdded=${capstoneResult.edgeAdded}, md=${capstoneResult.md.length} chars)`);