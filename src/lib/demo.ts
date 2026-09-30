import { randomUUID } from 'crypto';
import { prisma } from './prisma';
import { addDays, parseDateKey } from './dates';
import type { Mood } from './moods';

const DEMO_TTL_MS = 24 * 60 * 60 * 1000;

// Days before today, most recent first. Today is left open so a visitor can log it.
// Day 13 is skipped, which gives a 12-day current streak.
const DEMO_DAYS: { daysAgo: number; mood: Mood; notes?: string }[] = [
  { daysAgo: 1, mood: 'good', notes: 'Finished the group project early and went for a walk after dinner.' },
  { daysAgo: 2, mood: 'meh', notes: 'Nothing special. Rainy all day, stayed in and read.' },
  { daysAgo: 3, mood: 'good', notes: 'Called grandma. She told the story about the mango tree again.' },
  { daysAgo: 4, mood: 'stress', notes: 'Two deadlines on the same day. Made a list and got through the first one.' },
  { daysAgo: 5, mood: 'good' },
  { daysAgo: 6, mood: 'neutral', notes: 'Missed my friends today. Sent a message to the old group chat.' },
  { daysAgo: 7, mood: 'good', notes: 'Slept eight hours for once. Everything felt easier.' },
  { daysAgo: 8, mood: 'meh' },
  { daysAgo: 9, mood: 'bad', notes: 'Argued with my brother over something small. We talked it out later.' },
  { daysAgo: 10, mood: 'good', notes: 'Tried a new recipe and it actually worked.' },
  { daysAgo: 11, mood: 'good' },
  { daysAgo: 12, mood: 'stress', notes: 'Exam week starts. Short walk helped more than I expected.' },
  { daysAgo: 14, mood: 'meh' },
  { daysAgo: 15, mood: 'good', notes: 'Sketched for an hour with no phone nearby.' },
  { daysAgo: 16, mood: 'neutral' },
  { daysAgo: 17, mood: 'good' },
  { daysAgo: 18, mood: 'meh', notes: 'Tired, but I kept the routine going.' },
  { daysAgo: 19, mood: 'good' },
  { daysAgo: 20, mood: 'stress' },
];

// Creates a private, pre-filled account for a visitor. With the seeded data the
// pet sits just below level 4, so logging today's mood levels it up.
export async function createDemoUser(todayKey: string) {
  await prisma.user.deleteMany({
    where: { isDemo: true, createdAt: { lt: new Date(Date.now() - DEMO_TTL_MS) } },
  });

  const id = randomUUID();
  const handle = `demo-${id.slice(0, 8)}`;
  const today = parseDateKey(todayKey);
  const days = DEMO_DAYS.map((day) => ({ ...day, date: parseDateKey(addDays(todayKey, -day.daysAgo)) }));

  return prisma.user.create({
    data: {
      id,
      username: handle,
      email: `${handle}@demo.haello.app`,
      // Not a bcrypt hash, so no password can ever match it.
      password: 'demo-account-no-password',
      nickname: 'Guest',
      isDemo: true,
      personalization: 'Self-Care & Wellness',
      moods: { create: days.map(({ date, mood }) => ({ date, mood })) },
      journals: { create: days.map(({ date, mood, notes }) => ({ date, mood, notes: notes ?? null })) },
      goals: {
        create: [
          { title: 'Take a 15-minute walk', description: 'Get some fresh air and movement', icon: '🚶', period: 'Daily' },
          { title: 'Practice mindfulness', description: 'Spend 10 minutes in quiet reflection', icon: '🧘', period: 'Daily' },
          { title: 'Get 7-8 hours of sleep', description: 'Prioritize rest and recovery', icon: '😴', period: 'Daily' },
          {
            title: 'Call a friend',
            description: 'Catch up with someone you care about',
            icon: '💬',
            period: 'Weekly',
            completed: true,
            completedAt: today,
          },
        ],
      },
      streaks: { create: { currentStreak: 12, longestStreak: 12 } },
      petSettings: { create: { petName: 'Mochi', petType: 'default', goalXp: 30 } },
    },
  });
}
