import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm/sql';

const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me';

export async function registerUser({ name, email, password }: { name: string; email: string; password: string }) {
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning();

  return created;
}

export async function loginUser({ email, password }: { email: string; password: string }) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export function createToken(user: { id: number; email: string; name: string }) {
  return jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '7d',
  });
}
