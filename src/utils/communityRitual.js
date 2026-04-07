export function getWeekRefFromDate(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getCurrentRitualTags() {
  const weekRef = getWeekRefFromDate();
  const ritualTag = `ritual:${weekRef}`;
  return {
    weekRef,
    ritualTag,
    tags: [ritualTag],
  };
}

export function getCurrentIntegratedTags() {
  const weekRef = getWeekRefFromDate();
  const integratedTag = `integrada:${weekRef}`;
  return {
    weekRef,
    integratedTag,
    tags: ['integrada', integratedTag],
  };
}

export function mergeCommunityTags(...tagGroups) {
  return Array.from(
    new Set(
      tagGroups
        .flat()
        .filter((tag) => typeof tag === 'string')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}
