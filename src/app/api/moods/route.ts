import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET all moods for the authenticated user
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

    let whereClause: any = { userId: userPayload.userId };

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const moods = await prisma.mood.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ moods });

  } catch (error) {
    console.error('Get moods error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create or update a mood entry
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
    const { date, mood } = body;

    if (!date || !mood) {
      return NextResponse.json(
        { error: 'Date and mood are required' },
        { status: 400 }
      );
    }

    const moodEntry = await prisma.mood.upsert({
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

    return NextResponse.json({
      message: 'Mood saved successfully',
      mood: moodEntry,
    });

  } catch (error) {
    console.error('Save mood error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
