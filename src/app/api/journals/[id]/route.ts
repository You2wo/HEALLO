import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clientToday } from '@/lib/dates';
import { syncPet } from '@/lib/game';
import { isMood } from '@/lib/moods';
import { currentUser, errorResponse, serverError, unauthorized } from '@/lib/http';

type RouteContext = { params: Promise<{ id: string }> };

// GET a specific journal entry
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { id } = await params;
    const journal = await prisma.journal.findFirst({
      where: { id, userId: userPayload.userId },
    });

    if (!journal) return errorResponse('Journal not found', 404);

    return NextResponse.json({ journal });
  } catch (error) {
    return serverError('Get journal error', error);
  }
}

// PUT update a journal entry
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { id } = await params;
    const userId = userPayload.userId;
    const body = await request.json();

    const existingJournal = await prisma.journal.findFirst({ where: { id, userId } });
    if (!existingJournal) return errorResponse('Journal not found', 404);

    if (body.mood !== undefined && !isMood(body.mood)) {
      return errorResponse('Unknown mood', 400);
    }

    const mood: string = body.mood ?? existingJournal.mood;
    const notes = body.notes !== undefined ? String(body.notes).trim() || null : existingJournal.notes;

    const [journal] = await prisma.$transaction([
      prisma.journal.update({ where: { id }, data: { mood, notes } }),
      prisma.mood.updateMany({ where: { userId, date: existingJournal.date }, data: { mood } }),
    ]);

    return NextResponse.json({
      message: 'Journal updated successfully',
      journal,
      ...(await syncPet(userId, clientToday(request))),
    });
  } catch (error) {
    return serverError('Update journal error', error);
  }
}

// DELETE a journal entry and its mood
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { id } = await params;
    const userId = userPayload.userId;

    const existingJournal = await prisma.journal.findFirst({ where: { id, userId } });
    if (!existingJournal) return errorResponse('Journal not found', 404);

    await prisma.$transaction([
      prisma.journal.delete({ where: { id } }),
      prisma.mood.deleteMany({ where: { userId, date: existingJournal.date } }),
    ]);

    return NextResponse.json({
      message: 'Journal deleted successfully',
      ...(await syncPet(userId, clientToday(request))),
    });
  } catch (error) {
    return serverError('Delete journal error', error);
  }
}
