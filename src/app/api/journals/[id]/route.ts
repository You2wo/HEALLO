import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET a specific journal entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const journal = await prisma.journal.findFirst({
      where: {
        id: params.id,
        userId: userPayload.userId,
      }
    });

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ journal });

  } catch (error) {
    console.error('Get journal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update a journal entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mood, notes } = body;

    // Check if journal exists and belongs to user
    const existingJournal = await prisma.journal.findFirst({
      where: {
        id: params.id,
        userId: userPayload.userId,
      }
    });

    if (!existingJournal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    const journal = await prisma.journal.update({
      where: { id: params.id },
      data: {
        mood: mood || existingJournal.mood,
        notes: notes !== undefined ? notes : existingJournal.notes,
      }
    });

    // Also update mood entry
    if (mood) {
      await prisma.mood.updateMany({
        where: {
          userId: userPayload.userId,
          date: existingJournal.date,
        },
        data: { mood }
      });
    }

    return NextResponse.json({
      message: 'Journal updated successfully',
      journal,
    });

  } catch (error) {
    console.error('Update journal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a journal entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if journal exists and belongs to user
    const existingJournal = await prisma.journal.findFirst({
      where: {
        id: params.id,
        userId: userPayload.userId,
      }
    });

    if (!existingJournal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    await prisma.journal.delete({
      where: { id: params.id }
    });

    // Also delete mood entry
    await prisma.mood.deleteMany({
      where: {
        userId: userPayload.userId,
        date: existingJournal.date,
      }
    });

    return NextResponse.json({
      message: 'Journal deleted successfully',
    });

  } catch (error) {
    console.error('Delete journal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
