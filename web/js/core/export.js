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

/**
 * Rasterize SVG to PNG data URL. Accepts optional env for testing (Image, document).
 */
export function rasterizeSvgToPng(svgString, width = 800, height = 400, env = globalThis) {
  const ImageCtor = env.Image;
  const doc = env.document;
  if (!ImageCtor || !doc) {
    throw new Error('DOM Image and document required for PNG rasterization');
  }

  return new Promise((resolve, reject) => {
    const img = new ImageCtor();
    img.onload = () => {
      const canvas = doc.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0e14';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load SVG for PNG rasterization'));
    img.src = svgToDataUrl(svgString);
  });
}