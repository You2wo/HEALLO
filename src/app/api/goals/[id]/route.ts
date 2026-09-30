import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clientToday, parseDateKey } from '@/lib/dates';
import { syncPet } from '@/lib/game';
import { GOAL_PERIODS, XP } from '@/lib/progress';
import { currentUser, errorResponse, serverError, unauthorized } from '@/lib/http';

type RouteContext = { params: Promise<{ id: string }> };

// PUT update a goal's details
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { id } = await params;
    const body = await request.json();

    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: userPayload.userId },
    });
    if (!existingGoal) return errorResponse('Goal not found', 404);

    const data: { title?: string; description?: string | null; icon?: string; period?: string } = {};
    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) return errorResponse('Title is required', 400);
      data.title = title;
    }
    if (body.description !== undefined) data.description = String(body.description).trim() || null;
    if (body.icon !== undefined) data.icon = body.icon;
    if (body.period !== undefined && GOAL_PERIODS.includes(body.period)) data.period = body.period;

    const goal = await prisma.goal.update({ where: { id }, data });

    return NextResponse.json({ message: 'Goal updated successfully', goal });
  } catch (error) {
    return serverError('Update goal error', error);
  }
}

// DELETE a goal. XP already earned from it stays banked.
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { id } = await params;
    const { count } = await prisma.goal.deleteMany({
      where: { id, userId: userPayload.userId },
    });
    if (count === 0) return errorResponse('Goal not found', 404);

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    return serverError('Delete goal error', error);
  }
}

// PATCH toggle goal completion and bank or return its XP
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { id } = await params;
    const userId = userPayload.userId;
    const today = clientToday(request);

    const existingGoal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!existingGoal) return errorResponse('Goal not found', 404);

    const completing = !existingGoal.completed;
    const pet = await prisma.petSettings.findUnique({ where: { userId }, select: { goalXp: true } });
    const goalXp = Math.max(0, (pet?.goalXp ?? 0) + (completing ? XP.goal : -XP.goal));

    const [goal] = await prisma.$transaction([
      prisma.goal.update({
        where: { id },
        data: { completed: completing, completedAt: completing ? parseDateKey(today) : null },
      }),
      prisma.petSettings.upsert({
        where: { userId },
        update: { goalXp },
        create: { userId, petName: 'Heallo', petType: 'default', goalXp },
      }),
    ]);

    return NextResponse.json({
      message: 'Goal toggled successfully',
      goal,
      ...(await syncPet(userId, today)),
    });
  } catch (error) {
    return serverError('Toggle goal error', error);
  }
}
