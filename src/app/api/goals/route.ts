import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clientToday, toDateKey } from '@/lib/dates';
import { GOAL_PERIODS, goalHasReset } from '@/lib/progress';
import { currentUser, errorResponse, serverError, unauthorized } from '@/lib/http';

// GET all goals for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const userId = userPayload.userId;
    const today = clientToday(request);

    // Reopen completed goals whose period has rolled over.
    const completed = await prisma.goal.findMany({
      where: { userId, completed: true },
      select: { id: true, period: true, completedAt: true },
    });
    const resetIds = completed
      .filter((goal) => !goal.completedAt || goalHasReset(goal.period, toDateKey(goal.completedAt), today))
      .map((goal) => goal.id);
    if (resetIds.length > 0) {
      await prisma.goal.updateMany({
        where: { id: { in: resetIds } },
        data: { completed: false, completedAt: null },
      });
    }

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    return serverError('Get goals error', error);
  }
}

// POST create a new goal
export async function POST(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const body = await request.json();
    const title = String(body.title ?? '').trim();

    if (!title) return errorResponse('Title is required', 400);
    if (title.length > 80) return errorResponse('Title must be 80 characters or fewer', 400);

    const goal = await prisma.goal.create({
      data: {
        userId: userPayload.userId,
        title,
        description: String(body.description ?? '').trim() || null,
        icon: body.icon || '🌱',
        period: GOAL_PERIODS.includes(body.period) ? body.period : 'Daily',
      },
    });

    return NextResponse.json({ message: 'Goal created successfully', goal }, { status: 201 });
  } catch (error) {
    return serverError('Create goal error', error);
  }
}
