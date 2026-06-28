const SCENARIOS = {
  compliance: {
    label: 'Compliance policy lookup',
    steps: [
      { phase: 'thought', thought: 'I need to find the latest compliance policy for data retention.', action: null, observation: null },
      { phase: 'action', thought: 'I need to find the latest compliance policy for data retention.', action: 'search_knowledge_base(query="data retention policy")', observation: null },
      { phase: 'observation', thought: 'I need to find the latest compliance policy for data retention.', action: 'search_knowledge_base(query="data retention policy")', observation: 'Found 3 documents: Policy v2.1 (2025), GDPR Addendum, Internal Audit Guide.' },
      { phase: 'thought', thought: 'The policy requires 7-year retention for financial records. I can now answer.', action: null, observation: 'Found 3 documents: Policy v2.1 (2025), GDPR Addendum, Internal Audit Guide.' },
      { phase: 'action', thought: 'The policy requires 7-year retention for financial records. I can now answer.', action: 'respond(answer="Financial records must be retained for 7 years per Policy v2.1.")', observation: null },
      { phase: 'observation', thought: 'The policy requires 7-year retention for financial records. I can now answer.', action: 'respond(answer="Financial records must be retained for 7 years per Policy v2.1.")', observation: 'Response delivered to user.' },
    ],
  },
  incident: {
    label: 'Incident triage',
    steps: [
      { phase: 'thought', thought: 'User reports API latency spike in production region us-east-1.', action: null, observation: null },
      { phase: 'action', thought: 'User reports API latency spike in production region us-east-1.', action: 'query_metrics(service="payments-api", region="us-east-1", window="15m")', observation: null },
      { phase: 'observation', thought: 'User reports API latency spike in production region us-east-1.', action: 'query_metrics(service="payments-api", region="us-east-1", window="15m")', observation: 'p99 latency 4.2s (baseline 180ms). Error rate 12%.' },
      { phase: 'thought', thought: 'Correlate with recent deploys and dependency health.', action: null, observation: 'p99 latency 4.2s (baseline 180ms). Error rate 12%.' },
      { phase: 'action', thought: 'Correlate with recent deploys and dependency health.', action: 'check_deployments(service="payments-api", hours=2)', observation: null },
      { phase: 'observation', thought: 'Correlate with recent deploys and dependency health.', action: 'check_deployments(service="payments-api", hours=2)', observation: 'Deploy v3.14.2 rolled out 22m ago. Auth service dependency degraded.' },
    ],
  },
  code_review: {
    label: 'Code review assistant',
    steps: [
      { phase: 'thought', thought: 'Review PR #482 for security and correctness in auth middleware.', action: null, observation: null },
      { phase: 'action', thought: 'Review PR #482 for security and correctness in auth middleware.', action: 'fetch_diff(pr=482, paths=["src/auth/*"])', observation: null },
      { phase: 'observation', thought: 'Review PR #482 for security and correctness in auth middleware.', action: 'fetch_diff(pr=482, paths=["src/auth/*"])', observation: 'Diff shows new JWT validation but missing rate limiting on token refresh.' },
      { phase: 'thought', thought: 'Flag missing rate limit and suggest test coverage.', action: null, observation: 'Diff shows new JWT validation but missing rate limiting on token refresh.' },
      { phase: 'action', thought: 'Flag missing rate limit and suggest test coverage.', action: 'post_review(comment="Add rate limit on refresh endpoint; include negative test for expired tokens")', observation: null },
      { phase: 'observation', thought: 'Flag missing rate limit and suggest test coverage.', action: 'post_review(comment="Add rate limit on refresh endpoint; include negative test for expired tokens")', observation: 'Review comment posted. CI triggered.' },
    ],
  },
};

const REFLECTION_ADDENDUM = {
  phase: 'reflection',
  thought: 'Critic: Verify the answer cites the correct policy version and mentions exceptions.',
  action: 'revise_response(add_caveat="Exceptions apply for litigation holds.")',
  observation: 'Revised response with governance caveat appended.',
};

export function getReactScenarios() {
  return Object.entries(SCENARIOS).map(([id, s]) => ({ id, label: s.label, stepCount: s.steps.length }));
}

export function createReactState(reflectionEnabled = false, scenarioId = 'compliance') {
  return {
    stepIndex: 0,
    scenarioId: SCENARIOS[scenarioId] ? scenarioId : 'compliance',
    reflectionEnabled,
    reflectionApplied: false,
    complete: false,
    steps: [],
  };
}

/** @param {object} currentState @param {'advance'|'reset'|'setScenario'} [action] @param {string} [payload] */
export function reactStep(currentState, action = 'advance', payload = null) {
  if (action === 'reset') {
    return {
      state: createReactState(currentState.reflectionEnabled, currentState.scenarioId),
      entry: null,
      display: 'Simulation reset.',
      metrics: null,
    };
  }

  if (action === 'setScenario' && payload && SCENARIOS[payload]) {
    return {
      state: createReactState(currentState.reflectionEnabled, payload),
      entry: null,
      display: `Scenario: ${SCENARIOS[payload].label}`,
      metrics: null,
    };
  }

  const state = {
    stepIndex: currentState.stepIndex,
    scenarioId: currentState.scenarioId,
    reflectionEnabled: currentState.reflectionEnabled,
    reflectionApplied: currentState.reflectionApplied,
    complete: currentState.complete,
    steps: [...currentState.steps],
  };

  const scenario = SCENARIOS[state.scenarioId] || SCENARIOS.compliance;
  const steps = [...scenario.steps];

  if (state.stepIndex >= steps.length) {
    if (state.reflectionEnabled && !state.reflectionApplied) {
      const entry = formatReactEntry(REFLECTION_ADDENDUM);
      const newState = {
        ...state,
        reflectionApplied: true,
        steps: [...state.steps, entry],
        complete: true,
      };
      return {
        state: newState,
        entry,
        display: entry.text,
        metrics: { latency: 1.4, cost: 0.08, quality: 0.92 },
      };
    }
    return { state: { ...state, complete: true }, entry: null, display: 'Simulation complete.', metrics: null };
  }

  const raw = steps[state.stepIndex];
  const entry = formatReactEntry(raw);
  const newState = {
    ...state,
    stepIndex: state.stepIndex + 1,
    steps: [...state.steps, entry],
    complete:
      state.stepIndex + 1 >= steps.length &&
      (!state.reflectionEnabled || state.reflectionApplied),
  };

  const metrics = {
    latency: 0.3 + state.stepIndex * 0.15,
    cost: 0.02 + state.stepIndex * 0.01,
    quality: state.reflectionEnabled ? 0.85 + state.stepIndex * 0.02 : 0.7 + state.stepIndex * 0.03,
    phase: raw.phase,
    scenario: state.scenarioId,
  };

  return { state: newState, entry, display: entry.text, metrics };
}

export function toggleReflection(state, enabled) {
  return {
    ...createReactState(enabled, state.scenarioId),
    reflectionEnabled: enabled,
  };
}

function formatReactEntry(raw) {
  const parts = [];
  if (raw.thought) parts.push(`Thought: ${raw.thought}`);
  if (raw.action) parts.push(`Action: ${raw.action}`);
  if (raw.observation) parts.push(`Observation: ${raw.observation}`);
  if (raw.phase === 'reflection') {
    parts.push(`Reflection: ${raw.thought}`);
    if (raw.action) parts.push(`Action: ${raw.action}`);
    if (raw.observation) parts.push(`Observation: ${raw.observation}`);
  }
  return { phase: raw.phase, text: parts.join('\n'), parts };
}

export function getReactScenarioLength(scenarioId = 'compliance') {
  return (SCENARIOS[scenarioId] || SCENARIOS.compliance).steps.length;
}