#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createReactState, reactStep } from '../web/js/core/react-simulator.js';
import { switchTopology } from '../web/js/core/topology-simulator.js';
import { createSketch, addNode, addEdge, setAnnotations } from '../web/js/core/sketch-model.js';
import { renderSketchSvg } from '../web/js/core/sketch-render.js';
import { generateExport, rasterizeSvgToPng } from '../web/js/core/export.js';
import { WIZARD_STEPS } from '../web/js/data/curriculum.js';

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

// Build sketch via addNode/place flow (not capstone template)
let sketch = createSketch('User-built architecture');
sketch = addNode(sketch, 'Agent', 'Orchestrator', 120, 100);
sketch = addNode(sketch, 'Tool', 'KB Search', 300, 100);
sketch = addNode(sketch, 'HITL', 'Approval Gate', 210, 220);
sketch = addEdge(sketch, sketch.nodes[0].id, sketch.nodes[1].id, 'retrieve');
sketch = addEdge(sketch, sketch.nodes[0].id, sketch.nodes[2].id, 'approve');
sketch = setAnnotations(sketch, 'HITL before external tool execution');

const svg = renderSketchSvg(sketch);
lines.push('--- renderSketchSvg ---', svg.slice(0, 200));

const mockEnv = {
  Image: class {
    set src(v) { this._src = v; setTimeout(() => this.onload?.(), 0); }
  },
  document: {
    createElement: () => ({
      width: 0, height: 0,
      getContext: () => ({ fillStyle: '', fillRect() {}, drawImage() {} }),
      toDataURL: (fmt) => `data:${fmt};base64,INTEGRATION`,
    }),
  },
};
const png = await rasterizeSvgToPng(svg, 800, 400, mockEnv);
lines.push('--- PNG from renderSketchSvg ---', png);

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

const md = generateExport(sketch, wizard);
lines.push('--- Full export from user-built sketch ---', md);
lines.push('--- Sketch stats ---', `nodes=${sketch.nodes.length} edges=${sketch.edges.length} annotations=${sketch.annotations}`);

WIZARD_STEPS.forEach((step) => {
  if (!md.includes(step)) throw new Error(`Export missing: ${step}`);
});
if ((md.match(/^## \d/gm) || []).length < 7) throw new Error('Export missing 7 sections');
if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) throw new Error('SVG missing xmlns');

writeFileSync(join(SCRATCH, 'sim-and-export.txt'), lines.join('\n'));
console.log(`Wrote sim-and-export.txt (${md.length} chars, ${sketch.edges.length} edges)`);