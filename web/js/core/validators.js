import { WIZARD_STEPS } from '../data/curriculum.js';

const MIN_TRADEOFFS = 3;
const MIN_FAILURES = 5;

export function validateWizard(wizardData) {
  const errors = [];
  const warnings = [];

  if (!wizardData.scenario?.trim()) errors.push('Scenario is required');
  if (!wizardData.justify?.trim()) errors.push('Justify Choices is required');

  const tradeoffs = (wizardData.tradeoffs || []).filter((t) => t?.trim());
  if (tradeoffs.length < MIN_TRADEOFFS) {
    errors.push(`At least ${MIN_TRADEOFFS} tradeoffs required (have ${tradeoffs.length})`);
  }

  const failures = (wizardData.failures || []).filter((f) => f?.risk?.trim() && f?.mitigation?.trim());
  if (failures.length < MIN_FAILURES) {
    errors.push(`At least ${MIN_FAILURES} failure modes required (have ${failures.length})`);
  }

  if (!wizardData.costLatency?.trim()) warnings.push('Cost/Latency considerations recommended');

  const complete = errors.length === 0;
  return {
    complete,
    interviewReady: complete && wizardData.teachBackCompleted,
    errors,
    warnings,
    counts: { tradeoffs: tradeoffs.length, failures: failures.length },
  };
}

export function validateSketch(sketch, wizardData) {
  const wizard = validateWizard(wizardData);
  const nodeErrors = [];
  if (!sketch.nodes.length) nodeErrors.push('Sketch must have at least one node');
  const errors = [...wizard.errors, ...nodeErrors];
  return {
    ...wizard,
    complete: wizard.complete && nodeErrors.length === 0,
    sketchValid: nodeErrors.length === 0,
    errors,
  };
}

export function getWizardStepLabels() {
  return WIZARD_STEPS;
}