import { describe, expect, it } from 'vitest';
import { addDays, clientToday, diffDays, isDateKey, monthRange, parseDateKey, toDateKey } from '../src/lib/dates';
import { countStreak, goalHasReset, levelForXp, levelProgress, totalXp, xpForLevel } from '../src/lib/progress';
import { pickSpeech, speechSituation, type SpeechState } from '../src/lib/speech';

describe('dates', () => {
  it('validates date keys', () => {
    expect(isDateKey('2026-09-30')).toBe(true);
    expect(isDateKey('2026-13-40')).toBe(false);
    expect(isDateKey('2026-9-3')).toBe(false);
    expect(isDateKey(null)).toBe(false);
  });

  it('round-trips keys through UTC midnight', () => {
    expect(parseDateKey('2026-09-30').toISOString()).toBe('2026-09-30T00:00:00.000Z');
    expect(toDateKey(parseDateKey('2026-01-01'))).toBe('2026-01-01');
  });

  it('adds and diffs days across month boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-10-02', '2026-09-30')).toBe(2);
  });

  it('trusts the client date only within a day of the server date', () => {
    const now = new Date('2026-09-30T18:00:00Z');
    const request = (value?: string) =>
      new Request('http://x', { headers: value ? { 'x-client-date': value } : {} });
    expect(clientToday(request('2026-10-01'), now)).toBe('2026-10-01');
    expect(clientToday(request('2026-10-05'), now)).toBe('2026-09-30');
    expect(clientToday(request('nonsense'), now)).toBe('2026-09-30');
    expect(clientToday(request(), now)).toBe('2026-09-30');
  });

  it('bounds a month in UTC', () => {
    const { gte, lt } = monthRange(2026, 12);
    expect(gte.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(lt.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });
});

describe('streak', () => {
  const today = '2026-09-30';

  it('counts consecutive days ending today', () => {
    expect(countStreak(['2026-09-30', '2026-09-29', '2026-09-28'], today)).toBe(3);
  });

  it('keeps the streak alive when today is not logged yet', () => {
    expect(countStreak(['2026-09-29', '2026-09-28'], today)).toBe(2);
  });

  it('stops at a gap', () => {
    expect(countStreak(['2026-09-30', '2026-09-28', '2026-09-27'], today)).toBe(1);
  });

  it('is zero when the last entry is older than yesterday', () => {
    expect(countStreak(['2026-09-27'], today)).toBe(0);
    expect(countStreak([], today)).toBe(0);
  });
});

describe('xp and levels', () => {
  it('maps level thresholds', () => {
    expect([1, 2, 3, 4].map(xpForLevel)).toEqual([0, 50, 150, 300]);
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(49)).toBe(1);
    expect(levelForXp(50)).toBe(2);
    expect(levelForXp(149)).toBe(2);
    expect(levelForXp(300)).toBe(4);
  });

  it('adds up XP sources', () => {
    expect(totalXp({ moodDays: 19, journalsWithNotes: 11, goalXp: 30, longestStreak: 12 })).toBe(295);
  });

  it('reports progress inside a level', () => {
    expect(levelProgress(295)).toEqual({ level: 3, xp: 295, xpIntoLevel: 145, xpForNextLevel: 150 });
  });
});

describe('goal periods', () => {
  it('reopens daily goals the next day', () => {
    expect(goalHasReset('Daily', '2026-09-29', '2026-09-30')).toBe(true);
    expect(goalHasReset('Daily', '2026-09-30', '2026-09-30')).toBe(false);
  });

  it('reopens weekly goals on Monday', () => {
    // 2026-09-28 is a Monday.
    expect(goalHasReset('Weekly', '2026-09-27', '2026-09-28')).toBe(true);
    expect(goalHasReset('Weekly', '2026-09-28', '2026-09-30')).toBe(false);
  });

  it('reopens biweekly goals after 14 days', () => {
    expect(goalHasReset('Biweekly', '2026-09-17', '2026-09-30')).toBe(false);
    expect(goalHasReset('Biweekly', '2026-09-16', '2026-09-30')).toBe(true);
  });

  it('reopens monthly goals in a new month', () => {
    expect(goalHasReset('Monthly', '2026-09-01', '2026-09-30')).toBe(false);
    expect(goalHasReset('Monthly', '2026-09-30', '2026-10-01')).toBe(true);
  });
});

describe('pet speech', () => {
  const base: SpeechState = { nickname: 'Ash', streak: 3, moodLoggedToday: true, openGoals: 0, totalGoals: 2 };

  it('prioritises situations in order', () => {
    expect(speechSituation({ ...base, leveledUpTo: 4, moodLoggedToday: false })).toBe('levelUp');
    expect(speechSituation({ ...base, streak: 14 })).toBe('streakMilestone');
    expect(speechSituation({ ...base, moodLoggedToday: false })).toBe('noMood');
    expect(speechSituation({ ...base, openGoals: 2 })).toBe('goalsOpen');
    expect(speechSituation(base)).toBe('allDone');
    expect(speechSituation({ ...base, totalGoals: 0 })).toBe('greeting');
  });

  it('cycles variants by turn and uses the nickname', () => {
    const state = { ...base, moodLoggedToday: false };
    expect(pickSpeech(state, 0)).toContain('Ash');
    expect(pickSpeech(state, 1)).not.toBe(pickSpeech(state, 0));
    expect(pickSpeech(state, 3)).toBe(pickSpeech(state, 0));
  });
});
