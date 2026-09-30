import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clientToday } from '@/lib/dates';
import { syncPet } from '@/lib/game';
import { currentUser, errorResponse, serverError, unauthorized } from '@/lib/http';

// GET the pet, streak and today's mood for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    return NextResponse.json(await syncPet(userPayload.userId, clientToday(request)));
  } catch (error) {
    return serverError('Get pet error', error);
  }
}

// PUT rename the pet. Level and XP are earned, never set by the client.
export async function PUT(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const body = await request.json();
    const petName = String(body.petName ?? '').trim();
    if (!petName || petName.length > 20) {
      return errorResponse('Pet name must be between 1 and 20 characters', 400);
    }

    await prisma.petSettings.upsert({
      where: { userId: userPayload.userId },
      update: { petName },
      create: { userId: userPayload.userId, petName, petType: 'default' },
    });

    return NextResponse.json(await syncPet(userPayload.userId, clientToday(request)));
  } catch (error) {
    return serverError('Update pet error', error);
  }
}
