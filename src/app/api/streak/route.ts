import { NextRequest, NextResponse } from 'next/server';
import { clientToday } from '@/lib/dates';
import { syncStreak } from '@/lib/game';
import { currentUser, serverError, unauthorized } from '@/lib/http';

// GET streak for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const streak = await syncStreak(userPayload.userId, clientToday(request));

    return NextResponse.json({ streak });
  } catch (error) {
    return serverError('Get streak error', error);
  }
}
