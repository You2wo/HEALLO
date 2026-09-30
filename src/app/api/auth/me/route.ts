import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { publicUserSelect, verifyPassword } from '@/lib/auth';
import { currentUser, errorResponse, serverError, unauthorized } from '@/lib/http';

const PERSONALIZATION_CATEGORIES = ['Connection & Social', 'Self-Care & Wellness', 'Growth & Expression'];

export async function GET(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: publicUserSelect,
    });

    if (!user) return errorResponse('User not found', 404);

    return NextResponse.json({ user });
  } catch (error) {
    return serverError('Get user error', error);
  }
}

// PATCH update nickname or personalization category
export async function PATCH(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const body = await request.json();
    const data: { nickname?: string; personalization?: string } = {};

    if (body.nickname !== undefined) {
      const nickname = String(body.nickname).trim();
      if (!nickname || nickname.length > 30) {
        return errorResponse('Nickname must be between 1 and 30 characters', 400);
      }
      data.nickname = nickname;
    }

    if (body.personalization !== undefined) {
      if (!PERSONALIZATION_CATEGORIES.includes(body.personalization)) {
        return errorResponse('Unknown personalization category', 400);
      }
      data.personalization = body.personalization;
    }

    const user = await prisma.user.update({
      where: { id: userPayload.userId },
      data,
      select: publicUserSelect,
    });

    return NextResponse.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    return serverError('Update user error', error);
  }
}

// DELETE the account and everything attached to it
export async function DELETE(request: NextRequest) {
  try {
    const userPayload = currentUser(request);
    if (!userPayload) return unauthorized();

    const { password } = await request.json().catch(() => ({ password: undefined }));
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { password: true, isDemo: true },
    });

    if (!user) return errorResponse('User not found', 404);
    if (user.isDemo) return errorResponse('Demo accounts are removed automatically', 403);
    if (!password || !(await verifyPassword(String(password), user.password))) {
      return errorResponse('That password is not correct', 403);
    }

    await prisma.user.delete({ where: { id: userPayload.userId } });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    return serverError('Delete user error', error);
  }
}
