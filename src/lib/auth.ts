import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('JWT_SECRET is not set. Tokens are signed with the public default key.');
}

export interface JWTPayload {
  userId: string;
  email: string;
}

// The user fields that are safe to send to the browser.
export const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  nickname: true,
  isDemo: true,
  personalization: true,
  createdAt: true,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function getUserFromRequest(request: Request): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
