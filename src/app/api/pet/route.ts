import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET pet settings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let petSettings = await prisma.petSettings.findUnique({
      where: { userId: userPayload.userId }
    });

    // If no pet settings exist, create default ones
    if (!petSettings) {
      const user = await prisma.user.findUnique({
        where: { id: userPayload.userId },
        select: { nickname: true, username: true }
      });

      petSettings = await prisma.petSettings.create({
        data: {
          userId: userPayload.userId,
          petName: user?.nickname || user?.username || 'Pet',
          petType: 'default',
          petLevel: 1,
          petXp: 0,
        }
      });
    }

    return NextResponse.json({ petSettings });

  } catch (error) {
    console.error('Get pet settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update pet settings
export async function PUT(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { petName, petType, petLevel, petXp } = body;

    const updateData: any = {};
    if (petName !== undefined) updateData.petName = petName;
    if (petType !== undefined) updateData.petType = petType;
    if (petLevel !== undefined) updateData.petLevel = petLevel;
    if (petXp !== undefined) updateData.petXp = petXp;

    const petSettings = await prisma.petSettings.upsert({
      where: { userId: userPayload.userId },
      update: updateData,
      create: {
        userId: userPayload.userId,
        petName: petName || 'Pet',
        petType: petType || 'default',
        petLevel: petLevel || 1,
        petXp: petXp || 0,
      }
    });

    return NextResponse.json({
      message: 'Pet settings updated successfully',
      petSettings,
    });

  } catch (error) {
    console.error('Update pet settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
