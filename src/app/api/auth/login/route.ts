import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, publicUserSelect } from '@/lib/auth';
import { errorResponse, serverError } from '@/lib/http';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
      select: { ...publicUserSelect, password: true },
    });

    if (!user || user.isDemo) {
      return errorResponse('Invalid email or password', 401);
    }

    const { password: passwordHash, ...publicUser } = user;
    if (!(await verifyPassword(password, passwordHash))) {
      return errorResponse('Invalid email or password', 401);
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json({ message: 'Login successful', user: publicUser, token });
  } catch (error) {
    return serverError('Login error', error);
  }
}
