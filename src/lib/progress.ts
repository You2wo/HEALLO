import { addDays, diffDays, parseDateKey } from './dates';

export const XP = {
  mood: 10,
  journalNotes: 5,
  goal: 5,
  streakWeek: 20,
} as const;

// Level n starts at 25 * n * (n - 1) XP: 0, 50, 150, 300, 500...
export function xpForLevel(level: number): number {
  return 25 * level * (level - 1);
}

export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + (4 * Math.max(0, xp)) / 25)) / 2));
}

export interface XpSources {
  moodDays: number;
  journalsWithNotes: number;
  goalXp: number;
  longestStreak: number;
}

export function totalXp({ moodDays, journalsWithNotes, goalXp, longestStreak }: XpSources): number {
  return (
    moodDays * XP.mood +
    journalsWithNotes * XP.journalNotes +
    goalXp +
    Math.floor(longestStreak / 7) * XP.streakWeek
  );
}

export interface LevelProgress {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  return {
    level,
    xp,
    xpIntoLevel: xp - floor,
    xpForNextLevel: xpForLevel(level + 1) - floor,
  };
}

// Consecutive logged days ending today, or yesterday if today is not logged yet.
export function countStreak(dateKeys: Iterable<string>, todayKey: string): number {
  const days = new Set(dateKeys);
  let cursor = days.has(todayKey) ? todayKey : addDays(todayKey, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export const GOAL_PERIODS = ['Daily', 'Weekly', 'Biweekly', 'Monthly'] as const;
export type GoalPeriod = (typeof GOAL_PERIODS)[number];

// True when a goal completed on completedKey should be open again on todayKey.
export function goalHasReset(period: string, completedKey: string, todayKey: string): boolean {
  if (completedKey >= todayKey) return false;
  switch (period) {
    case 'Weekly': {
      // Weeks start on Monday.
      const weekday = (parseDateKey(todayKey).getUTCDay() + 6) % 7;
      return completedKey < addDays(todayKey, -weekday);
    }
    case 'Biweekly':
      return diffDays(todayKey, completedKey) >= 14;
    case 'Monthly':
      return completedKey.slice(0, 7) < todayKey.slice(0, 7);
    default:
      return true;
  }
}
