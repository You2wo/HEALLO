export const MOODS = ['good', 'neutral', 'bad', 'stress', 'meh'] as const;
export type Mood = (typeof MOODS)[number];

export function isMood(value: unknown): value is Mood {
  return typeof value === 'string' && (MOODS as readonly string[]).includes(value);
}

// The stored keys predate the labels, so 'neutral' is shown as Sad and 'bad' as Mad.
export const MOOD_META: Record<Mood, { label: string; icon: string; color: string }> = {
  good: { label: 'Happy', icon: '/mood-happy.svg', color: 'var(--mood-good)' },
  neutral: { label: 'Sad', icon: '/mood-sad.svg', color: 'var(--mood-neutral)' },
  bad: { label: 'Mad', icon: '/mood-mad.svg', color: 'var(--mood-bad)' },
  stress: { label: 'Stress', icon: '/mood-stress.svg', color: 'var(--mood-stress)' },
  meh: { label: 'Meh', icon: '/mood-meh.svg', color: 'var(--mood-meh)' },
};
