import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface AuthPayload {
  id: number;
  username: string;
  role: string;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
}

export function signAccessToken(payload: AuthPayload): string {
  const secret = getJwtSecret();
  const expiresInEnv = process.env.JWT_EXPIRES_IN || '1h';
  const options = { expiresIn: expiresInEnv } as SignOptions;
  return jwt.sign(payload, secret, options);
}

export async function hashPassword(plain: string): Promise<string> {
  const saltRoundsEnv = process.env.BCRYPT_SALT_ROUNDS;
  const saltRounds = saltRoundsEnv ? Number(saltRoundsEnv) : 10;

  if (Number.isNaN(saltRounds) || saltRounds <= 0) {
    throw new Error('Invalid BCRYPT_SALT_ROUNDS configuration');
  }

  return bcrypt.hash(plain, saltRounds);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, passwordHash);
}
