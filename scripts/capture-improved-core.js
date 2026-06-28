#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { evaluateCheckpoint } from '../web/js/core/checkpoints.js';
import { createReactState, reactStep } from '../web/js/core/react-simulator.js';
import { switchTopology } from '../web/js/core/topology-simulator.js';
import { simulateRagCascade } from '../web/js/core/rag-simulator.js';
import { selectSpan, injectFailureMode, createTraceState } from '../web/js/core/trace-simulator.js';
import { MODULES } from '../web/js/data/curriculum.js';

const SCRATCH = process.env.SCRATCH || '/var/folders/h5/777kg7xs0d3345cjkktl8qxc0000gn/T/grok-goal-5c88c7a4a5ac/implementer';
mkdirSync(SCRATCH, { recursive: true });

const lines = ['=== Improved core evidence ==='];

const cp = MODULES[0].checkpoints[0];
const pass = evaluateCheckpoint(
  'Enterprise governance and audit oversight reduce risk because compliance requires human control and liability management in regulated systems',
  cp,
);
const fail = evaluateCheckpoint('governance audit', cp);
lines.push('--- Checkpoint (strict) ---');
lines.push(`PASS: keywords=${pass.matchedKeywords.length} words=${pass.metrics.wordCount} chars=${pass.metrics.charCount}`);
lines.push(`FAIL: ${fail.feedback.slice(0, 120)}`);

let react = createReactState(false, 'incident');
const phaseLog = [];
for (let i = 0; i < 6; i++) {
  const r = reactStep(react, 'advance');
  react = r.state;
  phaseLog.push(`${r.entry.phase}:${r.entry.text.slice(0, 40)}`);
}
lines.push('--- ReAct incident scenario (full cycle) ---');
lines.push(phaseLog.join(' | '));
assertPhases(phaseLog);

const topo = switchTopology('handoffs');
lines.push('--- Topology layout ---');
lines.push(`nodes=${topo.metrics.nodeCount} edges=${topo.metrics.edgeCount} layoutEdges=${topo.viz.layout.edgePaths.length}`);

const rag = simulateRagCascade('hybrid', 'fusion');
lines.push('--- RAG hybrid fusion fail ---');
lines.push(`failures=${rag.failureCount} root=${rag.failurePoint} hint=${rag.recoveryHint}`);

let trace = createTraceState();
trace = selectSpan(trace, 's4').state;
const inj = injectFailureMode(trace, 'f2');
lines.push('--- Trace expand + inject ---');
lines.push(inj.message);

writeFileSync(join(SCRATCH, 'improved-core.txt'), lines.join('\n'));
console.log('Wrote improved-core.txt');

function assertPhases(log) {
  const phases = log.map((l) => l.split(':')[0]);
  const expected = ['thought', 'action', 'observation', 'thought', 'action', 'observation'];
  if (JSON.stringify(phases) !== JSON.stringify(expected)) {
    throw new Error(`ReAct phases mismatch: ${phases.join(',')}`);
  }
  if (!log.some((l) => l.startsWith('action:Action: query_metrics'))) {
    throw new Error('ReAct missing action phase content');
  }
  if (!log.some((l) => l.startsWith('observation:Observation: p99'))) {
    throw new Error('ReAct missing observation phase content');
  }
}