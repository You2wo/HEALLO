import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET all journals for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const whereClause: Record<string, unknown> = { userId: userPayload.userId };

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const journals = await prisma.journal.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ journals });

  } catch (error) {
    console.error('Get journals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { date, mood, notes } = body;

    if (!date || !mood) {
      return NextResponse.json(
        { error: 'Date and mood are required' },
        { status: 400 }
      );
    }

    // Check if journal entry already exists for this date
    const existingJournal = await prisma.journal.findUnique({
      where: {
        userId_date: {
          userId: userPayload.userId,
          date: new Date(date),
        }
      }
    });

    let journal;
    if (existingJournal) {
      // Update existing journal
      journal = await prisma.journal.update({
        where: { id: existingJournal.id },
        data: {
          mood,
          notes: notes || null,
        }
      });
    } else {
      // Create new journal
      journal = await prisma.journal.create({
        data: {
          userId: userPayload.userId,
          date: new Date(date),
          mood,
          notes: notes || null,
        }
      });
    }

    // Also update or create mood entry
    await prisma.mood.upsert({
      where: {
        userId_date: {
          userId: userPayload.userId,
          date: new Date(date),
        }
      },
      update: {
        mood,
      },
      create: {
        userId: userPayload.userId,
        date: new Date(date),
        mood,
      }
    });

    // Update streak
    await updateStreak(userPayload.userId);

    return NextResponse.json({
      message: existingJournal ? 'Journal updated successfully' : 'Journal created successfully',
      journal,
    }, { status: existingJournal ? 200 : 201 });

  } catch (error) {
    console.error('Create journal error:', error);
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

  // Get all mood entries for the user
  const moods = await prisma.mood.findMany({
    where: {
      userId,
      mood: { not: 'untracked' }
    },
    orderBy: { date: 'desc' }
  });

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

  // Get today's date string
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Start counting from today or yesterday
  let currentStreak = 0;
  const checkDate = new Date(today);
  
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
