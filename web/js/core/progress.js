const STORAGE_KEY = 'aaa-progress-v1';
const REVIEW_DAYS = [3, 7, 14];

export function createDefaultProgress() {
  return {
    startDate: Date.now(),
    moduleCompletion: {},
    checkpointAnswers: {},
    streak: { count: 0, lastDate: null },
    sketches: [],
    lastActivity: null,
  };
}

export function loadProgress() {
  if (typeof localStorage === 'undefined') return createDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...createDefaultProgress(), ...JSON.parse(raw) } : createDefaultProgress();
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress) {
  if (typeof localStorage === 'undefined') return progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress;
}

export function recordActivity(progress) {
  const today = new Date().toDateString();
  const last = progress.streak.lastDate;
  let count = progress.streak.count;
  if (last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    count = last === yesterday.toDateString() ? count + 1 : 1;
  }
  return saveProgress({
    ...progress,
    streak: { count, lastDate: today },
    lastActivity: Date.now(),
  });
}

export function markModuleComplete(progress, moduleId) {
  return saveProgress({
    ...progress,
    moduleCompletion: { ...progress.moduleCompletion, [moduleId]: true },
  });
}

export function computeModuleRings(progress, totalModules = 9) {
  const completed = Object.values(progress.moduleCompletion).filter(Boolean).length;
  return { completed, total: totalModules, percent: Math.round((completed / totalModules) * 100) };
}

export function computeReviewItems(progress, now = Date.now()) {
  const daysSinceStart = Math.floor((now - progress.startDate) / (1000 * 60 * 60 * 24));
  const dueDays = REVIEW_DAYS.filter((d) => daysSinceStart >= d);
  const items = [];

  if (dueDays.length) {
    const oldestCheckpoint = Object.entries(progress.checkpointAnswers).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldestCheckpoint) {
      items.push({ type: 'checkpoint', key: oldestCheckpoint[0], data: oldestCheckpoint[1], dueDay: dueDays[0] });
    }
    if (progress.sketches.length) {
      const oldest = [...progress.sketches].sort((a, b) => a.createdAt - b.createdAt)[0];
      items.push({ type: 'sketch', data: oldest, dueDay: dueDays[dueDays.length - 1] });
    }
  }

  return { daysSinceStart, dueDays, items };
}