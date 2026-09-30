import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, publicUserSelect } from '@/lib/auth';
import { clientToday } from '@/lib/dates';
import { createDemoUser } from '@/lib/demo';
import { serverError } from '@/lib/http';

// POST start a private, pre-filled demo account
export async function POST(request: NextRequest) {
  try {
    const created = await createDemoUser(clientToday(request));
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: created.id },
      select: publicUserSelect,
    });
    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json({ message: 'Demo account ready', user, token }, { status: 201 });
  } catch (error) {
    return serverError('Demo login error', error);
  }
}
