const REACT_SCENARIO = [
  {
    phase: 'thought',
    thought: 'I need to find the latest compliance policy for data retention.',
    action: null,
    observation: null,
  },
  {
    phase: 'action',
    thought: 'I need to find the latest compliance policy for data retention.',
    action: 'search_knowledge_base(query="data retention policy")',
    observation: null,
  },
  {
    phase: 'observation',
    thought: 'I need to find the latest compliance policy for data retention.',
    action: 'search_knowledge_base(query="data retention policy")',
    observation: 'Found 3 documents: Policy v2.1 (2025), GDPR Addendum, Internal Audit Guide.',
  },
  {
    phase: 'thought',
    thought: 'The policy requires 7-year retention for financial records. I can now answer.',
    action: null,
    observation: 'Found 3 documents: Policy v2.1 (2025), GDPR Addendum, Internal Audit Guide.',
  },
  {
    phase: 'action',
    thought: 'The policy requires 7-year retention for financial records. I can now answer.',
    action: 'respond(answer="Financial records must be retained for 7 years per Policy v2.1.")',
    observation: null,
  },
  {
    phase: 'observation',
    thought: 'The policy requires 7-year retention for financial records. I can now answer.',
    action: 'respond(answer="Financial records must be retained for 7 years per Policy v2.1.")',
    observation: 'Response delivered to user.',
  },
];

const REFLECTION_ADDENDUM = {
  phase: 'reflection',
  thought: 'Critic: Verify the answer cites the correct policy version and mentions exceptions.',
  action: 'revise_response(add_caveat="Exceptions apply for litigation holds.")',
  observation: 'Revised response with governance caveat appended.',
};

export function createReactState(reflectionEnabled = false) {
  return {
    stepIndex: 0,
    reflectionEnabled,
    reflectionApplied: false,
    complete: false,
    steps: [],
  };
}

export function reactStep(state) {
  const steps = [...REACT_SCENARIO];
  if (state.stepIndex >= steps.length) {
    if (state.reflectionEnabled && !state.reflectionApplied) {
      state.reflectionApplied = true;
      const entry = formatReactEntry(REFLECTION_ADDENDUM);
      state.steps.push(entry);
      return {
        state: { ...state, complete: true },
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
    complete: state.stepIndex + 1 >= steps.length && (!state.reflectionEnabled || state.reflectionApplied),
  };

  const metrics = {
    latency: 0.3 + state.stepIndex * 0.15,
    cost: 0.02 + state.stepIndex * 0.01,
    quality: state.reflectionEnabled ? 0.85 + state.stepIndex * 0.02 : 0.7 + state.stepIndex * 0.03,
  };

  return { state: newState, entry, display: entry.text, metrics };
}

export function toggleReflection(state, enabled) {
  return { ...state, reflectionEnabled: enabled, reflectionApplied: false, stepIndex: 0, steps: [], complete: false };
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

export function getReactScenarioLength() {
  return REACT_SCENARIO.length;
}