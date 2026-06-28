const TRACE = {
  spans: [
    { id: 's1', name: 'supervisor.route', duration: 120, status: 'ok' },
    { id: 's2', name: 'worker.research', duration: 890, status: 'ok', parent: 's1' },
    { id: 's3', name: 'tool.search_kb', duration: 340, status: 'ok', parent: 's2' },
    { id: 's4', name: 'worker.code', duration: 1200, status: 'error', parent: 's1' },
    { id: 's5', name: 'state.handoff', duration: 45, status: 'ok', parent: 's4' },
  ],
  failureModes: [
    { id: 'f1', risk: 'Cascading tool errors', mitigation: 'Circuit breaker on tool calls with fallback' },
    { id: 'f2', risk: 'State drift across handoffs', mitigation: 'Schema-validated state checkpoints' },
    { id: 'f3', risk: 'Eval blind spots on multi-agent flows', mitigation: 'End-to-end workflow traces with outcome metrics' },
    { id: 'f4', risk: 'Token cost explosion', mitigation: 'Model routing and semantic caching' },
    { id: 'f5', risk: 'Hallucination in synthesis step', mitigation: 'Groundedness checks before final output' },
  ],
};

export function getTrace() {
  return TRACE;
}

export function expandSpan(spanId) {
  const span = TRACE.spans.find((s) => s.id === spanId);
  if (!span) return null;
  const children = TRACE.spans.filter((s) => s.parent === spanId);
  const ancestors = [];
  let current = span;
  while (current?.parent) {
    const parent = TRACE.spans.find((s) => s.id === current.parent);
    if (parent) ancestors.unshift(parent);
    current = parent;
  }
  return {
    span,
    children,
    ancestors,
    totalDuration: span.duration + children.reduce((sum, c) => sum + c.duration, 0),
    hasError: span.status === 'error' || children.some((c) => c.status === 'error'),
  };
}

export function selectSpan(state, spanId) {
  const expanded = expandSpan(spanId);
  if (!expanded) return { state, expanded: null, message: 'Span not found' };
  return {
    state: { ...state, selectedSpanId: spanId },
    expanded,
    message: `${expanded.span.name}: ${expanded.span.duration}ms [${expanded.span.status}] — ${expanded.children.length} children`,
  };
}

export function injectFailureMode(state, failureId) {
  const mode = TRACE.failureModes.find((f) => f.id === failureId);
  if (!mode) return { state, injected: null, message: 'Unknown failure mode' };
  const injected = [...(state.injectedFailures || [])];
  if (!injected.includes(failureId)) injected.push(failureId);
  const mitigations = injected.map((id) => TRACE.failureModes.find((f) => f.id === id)?.mitigation).filter(Boolean);
  return {
    state: { ...state, injectedFailures: injected },
    injected: mode,
    mitigations,
    message: `Injected: ${mode.risk}. Active mitigations: ${mitigations.join('; ')}`,
  };
}

export function createTraceState() {
  return { selectedSpanId: null, injectedFailures: [] };
}

export function getFailureModes() {
  return TRACE.failureModes;
}