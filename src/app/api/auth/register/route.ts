import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, publicUserSelect } from '@/lib/auth';
import { errorResponse, serverError } from '@/lib/http';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body.username ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const nickname = String(body.nickname ?? '').trim() || username;

    if (!username || !email || !password) {
      return errorResponse('Username, email, and password are required', 400);
    }
    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters long', 400);
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true },
    });

    if (existingUser) {
      return errorResponse(
        existingUser.email === email
          ? 'An account with this email already exists. Try logging in instead.'
          : 'That username is taken. Please choose another.',
        409
      );
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await hashPassword(password),
        nickname,
        streaks: { create: {} },
        petSettings: { create: { petName: 'Heallo', petType: 'default' } },
      },
      select: publicUserSelect,
    });

    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json({ message: 'User registered successfully', user, token }, { status: 201 });
  } catch (error) {
    return serverError('Registration error', error);
  }
}
