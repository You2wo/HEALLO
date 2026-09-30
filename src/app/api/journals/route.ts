import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clientToday, isDateKey, monthRange, parseDateKey } from '@/lib/dates';
import { syncPet } from '@/lib/game';
import { isMood } from '@/lib/moods';
import { currentUser, errorResponse, serverError, unauthorized } from '@/lib/http';

// GET journals for the authenticated user, optionally for one month
export async function GET(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get('month'));
    const year = Number(searchParams.get('year'));

    const journals = await prisma.journal.findMany({
      where: {
        userId: userPayload.userId,
        ...(month && year ? { date: monthRange(year, month) } : {}),
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ journals });
  } catch (error) {
    return serverError('Get journals error', error);
  }
}

// POST log a day: saves the journal entry and its mood together
export async function POST(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const body = await request.json();
    const today = clientToday(request);

    if (!isDateKey(body.date) || !isMood(body.mood)) {
      return errorResponse('A date (YYYY-MM-DD) and a mood are required', 400);
    }
    if (body.date > today) {
      return errorResponse('You cannot log a day that has not happened yet', 400);
    }

    const userId = userPayload.userId;
    const date = parseDateKey(body.date);
    const mood = body.mood;
    const notes = String(body.notes ?? '').trim() || null;

    const existing = await prisma.journal.findUnique({
      where: { userId_date: { userId, date } },
      select: { id: true },
    });

    const [journal] = await prisma.$transaction([
      prisma.journal.upsert({
        where: { userId_date: { userId, date } },
        update: { mood, notes },
        create: { userId, date, mood, notes },
      }),
      prisma.mood.upsert({
        where: { userId_date: { userId, date } },
        update: { mood },
        create: { userId, date, mood },
      }),
    ]);

    return NextResponse.json(
      {
        message: existing ? 'Journal updated successfully' : 'Journal created successfully',
        journal,
        ...(await syncPet(userId, today)),
      },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    return serverError('Create journal error', error);
  }
}
