export function evaluateCheckpoint(answer, checkpoint) {
  const normalized = (answer || '').toLowerCase();
  const matched = (checkpoint.keywords || []).filter((kw) => normalized.includes(kw.toLowerCase()));
  const pass = matched.length >= 2 || normalized.length >= 40;
  return {
    pass,
    matchedKeywords: matched,
    explanation: checkpoint.explanation,
    feedback: pass
      ? `Good reasoning. Key concepts detected: ${matched.join(', ') || 'sufficient depth'}.`
      : `Consider addressing: governance, tradeoffs, enterprise constraints. ${checkpoint.explanation}`,
  };
}