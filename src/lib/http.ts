import { NextResponse } from 'next/server';
import { getUserFromRequest, type JWTPayload } from './auth';

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

// The token payload, or null when the request is not authenticated.
export function currentUser(request: Request): JWTPayload | null {
  return getUserFromRequest(request);
}

export const unauthorized = () => errorResponse('Unauthorized', 401);

export function serverError(label: string, error: unknown) {
  console.error(`${label}:`, error);
  return errorResponse('Internal server error', 500);
}
