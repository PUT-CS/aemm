import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const MIN_PASSWORD_LENGTH = 6;

export interface AuthPayload {
  id: number;
  username: string;
  role: string;
}

export interface TokenPayload extends AuthPayload {
  tokenVersion: number;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
}

export function signAccessToken(payload: TokenPayload): string {
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

let dummyHash: Promise<string> | undefined;

export async function verifyPasswordOrDummy(
  plain: string,
  passwordHash: string | undefined,
): Promise<boolean> {
  if (passwordHash) {
    return verifyPassword(plain, passwordHash);
  }

  dummyHash ??= hashPassword('dummy-password');
  await verifyPassword(plain, await dummyHash);
  return false;
}
