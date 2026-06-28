const PHASES = [
  { id: 'requirements', label: 'Requirements', duration: '2h' },
  { id: 'architecture', label: 'Architecture', duration: '3h' },
  { id: 'implementation', label: 'Implementation', duration: '8h' },
  { id: 'review', label: 'Review', duration: '1h' },
];

export function createTimelineState() {
  return { phaseIndex: 0, crashed: false, resumed: false, checkpoints: [] };
}

export function advanceTimeline(state) {
  if (state.phaseIndex >= PHASES.length) {
    return { state: { ...state, complete: true }, phase: null, message: 'Workflow complete.' };
  }
  const phase = PHASES[state.phaseIndex];
  const checkpoint = { phase: phase.id, timestamp: Date.now(), saved: true };
  return {
    state: {
      ...state,
      phaseIndex: state.phaseIndex + 1,
      checkpoints: [...state.checkpoints, checkpoint],
      complete: state.phaseIndex + 1 >= PHASES.length,
    },
    phase,
    message: `Checkpoint saved at ${phase.label}`,
  };
}

export function simulateCrash(state) {
  return {
    state: { ...state, crashed: true },
    message: `Crash during ${PHASES[state.phaseIndex]?.label || 'unknown'} phase. State may be lost without checkpoint.`,
  };
}

export function simulateResume(state) {
  const lastCheckpoint = state.checkpoints[state.checkpoints.length - 1];
  if (!lastCheckpoint) {
    return { state, message: 'No checkpoint available. Must restart from beginning.', resumed: false };
  }
  const resumeIndex = PHASES.findIndex((p) => p.id === lastCheckpoint.phase) + 1;
  return {
    state: { ...state, crashed: false, resumed: true, phaseIndex: Math.min(resumeIndex, PHASES.length) },
    message: `Resumed from checkpoint at ${lastCheckpoint.phase}.`,
    resumed: true,
  };
}

export function getPhases() {
  return PHASES;
}