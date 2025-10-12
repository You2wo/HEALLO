import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET streak for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let streak = await prisma.streak.findUnique({
      where: { userId: userPayload.userId }
    });

    // If no streak exists, create one
    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId: userPayload.userId,
          currentStreak: 0,
          longestStreak: 0,
        }
      });
    }

    // Recalculate streak to ensure it's up to date
    await updateStreak(userPayload.userId);

    // Fetch updated streak
    streak = await prisma.streak.findUnique({
      where: { userId: userPayload.userId }
    });

    return NextResponse.json({ streak });

  } catch (error) {
    console.error('Get streak error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update streak
async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all mood entries for the user (excluding untracked)
  const moods = await prisma.mood.findMany({
    where: {
      userId,
      mood: { not: 'untracked' }
    },
    orderBy: { date: 'desc' }
  });

  console.log('Total moods found:', moods.length);

  if (moods.length === 0) {
    await prisma.streak.upsert({
      where: { userId },
      update: { currentStreak: 0, lastUpdated: new Date() },
      create: { userId, currentStreak: 0, longestStreak: 0 }
    });
    return;
  }

  // Normalize dates to YYYY-MM-DD format for comparison
  const dateStrings = moods.map(m => {
    const d = new Date(m.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Remove duplicates and sort
  const uniqueDateStrings = [...new Set(dateStrings)].sort().reverse();
  
  console.log('Unique dates:', uniqueDateStrings);

  // Get today's date string
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Get yesterday's date string
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  console.log('Today:', todayString, 'Yesterday:', yesterdayString);

  // Start counting from today or yesterday
  let currentStreak = 0;
  let checkDate = new Date(today);
  
  // If no entry for today, start from yesterday
  if (!uniqueDateStrings.includes(todayString)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days backwards from the start date
  for (let i = 0; i < uniqueDateStrings.length; i++) {
    const checkDateString = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    
    if (uniqueDateStrings.includes(checkDateString)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1); // Move to previous day
    } else {
      // Gap found, stop counting
      break;
    }
  }

  console.log('Calculated streak:', currentStreak);

  // Get existing streak record
  const existingStreak = await prisma.streak.findUnique({
    where: { userId }
  });

  const longestStreak = existingStreak 
    ? Math.max(existingStreak.longestStreak, currentStreak)
    : currentStreak;

  await prisma.streak.upsert({
    where: { userId },
    update: {
      currentStreak,
      longestStreak,
      lastUpdated: new Date()
    },
    create: {
      userId,
      currentStreak,
      longestStreak
    }
  });
}
