import { prisma } from './prisma';
import { toDateKey } from './dates';
import { countStreak, levelProgress, totalXp } from './progress';

// Recalculates and stores the user's streak from their logged moods.
export async function syncStreak(userId: string, todayKey: string) {
  const moods = await prisma.mood.findMany({
    where: { userId, mood: { not: 'untracked' } },
    select: { date: true },
  });
  const currentStreak = countStreak(moods.map((m) => toDateKey(m.date)), todayKey);

  const existing = await prisma.streak.findUnique({ where: { userId } });
  const longestStreak = Math.max(existing?.longestStreak ?? 0, currentStreak);

  return prisma.streak.upsert({
    where: { userId },
    update: { currentStreak, longestStreak, lastUpdated: new Date() },
    create: { userId, currentStreak, longestStreak },
  });
}

// Recalculates the pet's XP and level from the user's activity and stores them.
export async function syncPet(userId: string, todayKey: string) {
  const streak = await syncStreak(userId, todayKey);
  const [moodDays, journalsWithNotes, moodToday] = await Promise.all([
    prisma.mood.count({ where: { userId, mood: { not: 'untracked' } } }),
    prisma.journal.count({ where: { userId, notes: { not: null } } }),
    prisma.mood.findFirst({
      where: { userId, date: new Date(`${todayKey}T00:00:00Z`), mood: { not: 'untracked' } },
      select: { mood: true },
    }),
  ]);

  const pet = await prisma.petSettings.upsert({
    where: { userId },
    update: {},
    create: { userId, petName: 'Heallo', petType: 'default' },
  });

  const progress = levelProgress(
    totalXp({ moodDays, journalsWithNotes, goalXp: pet.goalXp, longestStreak: streak.longestStreak })
  );

  if (pet.petXp !== progress.xp || pet.petLevel !== progress.level) {
    await prisma.petSettings.update({
      where: { userId },
      data: { petXp: progress.xp, petLevel: progress.level },
    });
  }

  return {
    pet: { name: pet.petName || 'Heallo', ...progress },
    streak: { current: streak.currentStreak, longest: streak.longestStreak },
    moodToday: moodToday?.mood ?? null,
  };
}
