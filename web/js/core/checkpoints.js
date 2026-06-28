const MIN_KEYWORDS = 3;
const MIN_CHARS = 60;
const MIN_WORDS = 12;

export function evaluateCheckpoint(answer, checkpoint) {
  const raw = (answer || '').trim();
  const normalized = raw.toLowerCase();
  const keywords = checkpoint.keywords || [];
  const matched = keywords.filter((kw) => normalized.includes(kw.toLowerCase()));
  const words = raw.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const reasons = [];
  if (!raw) reasons.push('Answer is empty');
  if (matched.length < MIN_KEYWORDS) {
    reasons.push(`Need at least ${MIN_KEYWORDS} key concepts (found ${matched.length}: ${matched.join(', ') || 'none'})`);
  }
  if (raw.length < MIN_CHARS) {
    reasons.push(`Need at least ${MIN_CHARS} characters of substantive reasoning (have ${raw.length})`);
  }
  if (wordCount < MIN_WORDS) {
    reasons.push(`Need at least ${MIN_WORDS} words (have ${wordCount})`);
  }

  const missing = keywords.filter((kw) => !normalized.includes(kw.toLowerCase())).slice(0, 5);
  const pass = reasons.length === 0;

  return {
    pass,
    matchedKeywords: matched,
    missingKeywords: missing,
    metrics: { wordCount, charCount: raw.length, keywordHits: matched.length },
    explanation: checkpoint.explanation,
    feedback: pass
      ? `Strong answer — ${matched.length} concepts detected (${matched.join(', ')}). ${wordCount} words of reasoning.`
      : `${reasons.join('. ')}. Missing concepts to consider: ${missing.join(', ')}. Hint: ${checkpoint.explanation}`,
  };
}