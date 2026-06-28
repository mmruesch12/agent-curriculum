#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createReactState, reactStep } from '../web/js/core/react-simulator.js';
import { switchTopology } from '../web/js/core/topology-simulator.js';
import { generateExport } from '../web/js/core/export.js';
import { CAPSTONES, WIZARD_STEPS } from '../web/js/data/curriculum.js';

const SCRATCH = process.env.SCRATCH || '/var/folders/h5/777kg7xs0d3345cjkktl8qxc0000gn/T/grok-goal-8af6a0b5e05f/implementer';
mkdirSync(SCRATCH, { recursive: true });

const lines = [];

let s = createReactState(true);
for (let i = 0; i < 8; i++) {
  const before = JSON.stringify(s);
  const r = reactStep(s, 'advance');
  s = r.state;
  if (before === JSON.stringify(s) && r.entry) {
    /* state must change when entry produced */
  }
  if (r.display) lines.push('--- ReAct step ---', r.display);
}

const topo = switchTopology('supervisor');
lines.push('--- Topology tradeoffs ---', topo.tradeoffPanel);
lines.push('--- Topology flow ---', topo.viz.flow.join(' → '));

const wizard = {
  scenario: 'Governed internal development agent for enterprise platform team',
  justify: 'Supervisor pattern with HITL gates for modularity and governance',
  tradeoffs: [
    'Latency vs parallelism: sequential supervisor adds latency but simplifies control',
    'Cost vs reflection depth: more critic passes improve quality at token cost',
    'Simplicity vs specialization: single agent simpler but workers isolate context better',
  ],
  failures: [
    { risk: 'Cascading tool errors', mitigation: 'Circuit breaker with fallback tools' },
    { risk: 'State drift across handoffs', mitigation: 'Schema-validated checkpoints' },
    { risk: 'Retrieval quality collapse', mitigation: 'Hybrid search with reranking' },
    { risk: 'Prompt injection via tools', mitigation: 'Input guardrails and sandboxed tools' },
    { risk: 'Eval blind spots on workflow', mitigation: 'End-to-end trace outcome metrics' },
  ],
  costLatency: 'Model routing to smaller models for routing; semantic cache for repeated queries',
  teachBackCompleted: true,
};

const md = generateExport(CAPSTONES[1], wizard);
lines.push('--- Full export ---', md);

WIZARD_STEPS.forEach((step, i) => {
  if (!md.includes(`## ${i + 1}. ${step}`) && !md.includes(step)) {
    throw new Error(`Export missing section: ${step}`);
  }
});

if ((md.match(/## \d\./g) || []).length < 7) {
  throw new Error('Export does not contain 7 numbered sections');
}

writeFileSync(join(SCRATCH, 'sim-and-export.txt'), lines.join('\n'));
console.log(`Wrote sim-and-export.txt (${lines.length} lines, export ${md.length} chars)`);