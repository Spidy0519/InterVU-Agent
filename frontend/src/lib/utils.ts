export function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

export function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-sky-700 bg-sky-50 border-sky-200';
  if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

export function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty) {
    case 'hard':
      return 'bg-sky-100 text-sky-800 border-sky-300';
    case 'medium':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
