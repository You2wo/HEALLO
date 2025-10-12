import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET all goals for the authenticated user
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
    const completed = searchParams.get('completed');

    const whereClause: Record<string, unknown> = { userId: userPayload.userId };

    if (completed !== null) {
      whereClause.completed = completed === 'true';
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals });

  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create a new goal
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
    const { title, description, icon, period } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        userId: userPayload.userId,
        title,
        description: description || null,
        icon: icon || '🌱',
        period: period || 'Daily',
        completed: false,
      }
    });

    return NextResponse.json({
      message: 'Goal created successfully',
      goal,
    }, { status: 201 });

  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
