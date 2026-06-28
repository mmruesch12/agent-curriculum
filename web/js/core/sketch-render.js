const NODE_COLORS = {
  Agent: '#6366f1',
  Tool: '#22d3ee',
  Memory: '#a78bfa',
  HITL: '#f59e0b',
  Guardrail: '#f87171',
  Router: '#34d399',
};

/** Pure SVG string for export and canvas (fixed 800x400 + xmlns for PNG rasterization). */
export function renderSketchSvg(sketch, selectedNodeId = null) {
  const nodeEls = sketch.nodes.map((n) => {
    const selected = selectedNodeId === n.id ? ' selected-first' : '';
    return `<g class="graph-node canvas-node${selected}" data-node-id="${n.id}" role="button" tabindex="0" aria-label="${n.type} ${n.label}">
      <rect class="node-rect" x="${n.x}" y="${n.y}" width="100" height="40" rx="8" fill="${NODE_COLORS[n.type] || '#6366f1'}" opacity="0.9"/>
      <text x="${n.x + 50}" y="${n.y + 25}" text-anchor="middle" fill="white" font-size="10" pointer-events="none">${n.label}</text>
    </g>`;
  }).join('');

  const edgeEls = sketch.edges.map((e) => {
    const from = sketch.nodes.find((n) => n.id === e.from);
    const to = sketch.nodes.find((n) => n.id === e.to);
    if (!from || !to) return '';
    return `<line x1="${from.x + 50}" y1="${from.y + 40}" x2="${to.x + 50}" y2="${to.y}" stroke="#22d3ee" stroke-width="2"/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" class="workspace-svg" width="800" height="400" viewBox="0 0 800 400" aria-label="Architecture sketch"><rect width="800" height="400" fill="#0a0e14" class="canvas-bg"/>${edgeEls}${nodeEls}</svg>`;
}