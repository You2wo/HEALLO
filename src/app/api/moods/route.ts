import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { monthRange } from '@/lib/dates';
import { currentUser, serverError, unauthorized } from '@/lib/http';

// GET moods for the authenticated user, optionally for one month
export async function GET(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { searchParams } = new URL(request.url);
    const month = Number(searchParams.get('month'));
    const year = Number(searchParams.get('year'));

    const moods = await prisma.mood.findMany({
      where: {
        userId: userPayload.userId,
        ...(month && year ? { date: monthRange(year, month) } : {}),
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ moods });
  } catch (error) {
    return serverError('Get moods error', error);
  }
}
