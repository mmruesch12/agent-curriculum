import { WIZARD_STEPS } from '../data/curriculum.js';

export function generateExport(sketch, wizardData) {
  const sections = [];

  sections.push(`# Architecture Export: ${sketch.name || 'Untitled'}\n`);
  sections.push(`## 1. ${WIZARD_STEPS[0]}\n${wizardData.scenario || '(not provided)'}\n`);
  sections.push(`## 2. ${WIZARD_STEPS[1]}\nNodes: ${sketch.nodes.length}, Edges: ${sketch.edges.length}\n`);
  sketch.nodes.forEach((n) => sections.push(`- [${n.type}] ${n.label} @ (${n.x}, ${n.y})`));
  sketch.edges.forEach((e) => sections.push(`- ${e.from} → ${e.to}${e.label ? ` (${e.label})` : ''}`));
  if (sketch.annotations) sections.push(`\nAnnotations: ${sketch.annotations}`);

  sections.push(`\n## 3. ${WIZARD_STEPS[2]}\n${wizardData.justify || '(not provided)'}\n`);

  sections.push(`## 4. ${WIZARD_STEPS[3]}`);
  (wizardData.tradeoffs || []).forEach((t, i) => t?.trim() && sections.push(`${i + 1}. ${t}`));

  sections.push(`\n## 5. ${WIZARD_STEPS[4]}`);
  (wizardData.failures || []).forEach((f, i) => {
    if (f?.risk?.trim()) sections.push(`${i + 1}. **${f.risk}** — Mitigation: ${f.mitigation || 'TBD'}`);
  });

  sections.push(`\n## 6. ${WIZARD_STEPS[5]}\n${wizardData.costLatency || '(not provided)'}\n`);
  sections.push(`## 7. ${WIZARD_STEPS[6]}\nTeach-back completed: ${wizardData.teachBackCompleted ? 'Yes' : 'No'}\n`);

  return sections.join('\n');
}

export function svgToDataUrl(svgString) {
  const encoded = encodeURIComponent(svgString).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}