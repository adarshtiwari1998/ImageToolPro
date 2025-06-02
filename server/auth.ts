
import bcrypt from 'bcrypt';
import { users } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isPremium?: boolean;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Get user from database
  const user = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
  
  if (!user.length) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user[0];
  next();
};

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.session?.userId) {
    return res.redirect('/login');
  }
  next();
};
