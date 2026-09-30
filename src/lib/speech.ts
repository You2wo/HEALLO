export interface SpeechState {
  nickname: string;
  leveledUpTo?: number;
  streak: number;
  moodLoggedToday: boolean;
  openGoals: number;
  totalGoals: number;
}

export type Situation = 'levelUp' | 'streakMilestone' | 'noMood' | 'goalsOpen' | 'allDone' | 'greeting';

const LINES: Record<Situation, ((s: SpeechState) => string)[]> = {
  levelUp: [
    (s) => `Level ${s.leveledUpTo}! I grew because you kept showing up.`,
    (s) => `We made it to level ${s.leveledUpTo}, ${s.nickname}!`,
  ],
  streakMilestone: [
    (s) => `${s.streak} days in a row. That is a real habit now.`,
    (s) => `A ${s.streak}-day streak, ${s.nickname}. I am proud of you.`,
  ],
  noMood: [
    (s) => `Hi ${s.nickname}! How are you feeling today?`,
    () => `I have not heard about your day yet. Want to log your mood?`,
    () => `Tap today on the calendar and tell me how it is going.`,
  ],
  goalsOpen: [
    (s) =>
      s.openGoals === 1
        ? `One goal left for today. You can do it.`
        : `${s.openGoals} goals left for today. One at a time.`,
    (s) => `Thanks for checking in, ${s.nickname}. Your goals are waiting when you are ready.`,
  ],
  allDone: [
    (s) => `Everything is done for today, ${s.nickname}. Time to rest.`,
    () => `Mood logged and goals finished. That was a good day.`,
  ],
  greeting: [
    (s) => `Hello, ${s.nickname}! I am glad you are here.`,
    () => `Add a routine and I will cheer you on.`,
  ],
};

export function speechSituation(state: SpeechState): Situation {
  if (state.leveledUpTo) return 'levelUp';
  if (state.moodLoggedToday && state.streak > 0 && state.streak % 7 === 0) return 'streakMilestone';
  if (!state.moodLoggedToday) return 'noMood';
  if (state.openGoals > 0) return 'goalsOpen';
  if (state.totalGoals > 0) return 'allDone';
  return 'greeting';
}

// `turn` picks a variant, so tapping the pet cycles through the lines.
export function pickSpeech(state: SpeechState, turn = 0): string {
  const lines = LINES[speechSituation(state)];
  return lines[turn % lines.length](state);
}
