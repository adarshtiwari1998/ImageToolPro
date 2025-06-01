import {
  users,
  imageJobs,
  toolUsage,
  subscriptionPlans,
  type User,
  type UpsertUser,
  type ImageJob,
  type InsertImageJob,
  type ToolUsage,
  type InsertToolUsage,
  type SubscriptionPlan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;

  // Image job operations
  createImageJob(job: InsertImageJob): Promise<ImageJob>;
  getImageJob(id: number): Promise<ImageJob | undefined>;
  updateImageJob(id: number, updates: Partial<ImageJob>): Promise<ImageJob>;
  getUserImageJobs(userId: string, limit?: number): Promise<ImageJob[]>;

  // Tool usage tracking
  recordToolUsage(usage: InsertToolUsage): Promise<ToolUsage>;
  getToolUsageStats(toolType?: string, startDate?: Date, endDate?: Date): Promise<any[]>;

  // Admin analytics
  getActiveUsers(): Promise<number>;
  getTotalProcessedImages(): Promise<number>;
  getPopularTools(): Promise<any[]>;
  getPremiumUsers(): Promise<number>;

  // Subscription plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        isPremium: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Image job operations
  async createImageJob(job: InsertImageJob): Promise<ImageJob> {
    const [imageJob] = await db.insert(imageJobs).values(job).returning();
    return imageJob;
  }

  async getImageJob(id: number): Promise<ImageJob | undefined> {
    const [job] = await db.select().from(imageJobs).where(eq(imageJobs.id, id));
    return job;
  }

  async updateImageJob(id: number, updates: Partial<ImageJob>): Promise<ImageJob> {
    const [job] = await db
      .update(imageJobs)
      .set(updates)
      .where(eq(imageJobs.id, id))
      .returning();
    return job;
  }

  async getUserImageJobs(userId: string, limit = 50): Promise<ImageJob[]> {
    return await db
      .select()
      .from(imageJobs)
      .where(eq(imageJobs.userId, userId))
      .orderBy(desc(imageJobs.createdAt))
      .limit(limit);
  }

  // Tool usage tracking
  async recordToolUsage(usage: InsertToolUsage): Promise<ToolUsage> {
    const [toolUsageRecord] = await db.insert(toolUsage).values(usage).returning();
    return toolUsageRecord;
  }

  async getToolUsageStats(toolType?: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    let query = db
      .select({
        toolType: toolUsage.toolType,
        count: count(),
        date: sql<string>`DATE(${toolUsage.createdAt})`,
      })
      .from(toolUsage);

    if (toolType) {
      query = query.where(eq(toolUsage.toolType, toolType));
    }

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(toolUsage.createdAt, startDate),
          lte(toolUsage.createdAt, endDate)
        )
      );
    }

    return await query
      .groupBy(toolUsage.toolType, sql`DATE(${toolUsage.createdAt})`)
      .orderBy(desc(sql`count`));
  }

  // Admin analytics
  async getActiveUsers(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))); // Last 30 days
    return result.count;
  }

  async getTotalProcessedImages(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(imageJobs)
      .where(eq(imageJobs.status, "completed"));
    return result.count;
  }

  async getPopularTools(): Promise<any[]> {
    return await db
      .select({
        toolType: toolUsage.toolType,
        count: count(),
      })
      .from(toolUsage)
      .groupBy(toolUsage.toolType)
      .orderBy(desc(count()))
      .limit(10);
  }

  async getPremiumUsers(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isPremium, true));
    return result.count;
  }

  // Subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.price);
  }
}

export const storage: IStorage = {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  },

  async createUser(user: UpsertUser & { password: string }): Promise<User> {
    const [newUser] = await db.insert(users).values({
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    }).returning();
    return newUser[0];
  },

  async upsertUser(user: UpsertUser): Promise<User> {
    const [updatedUser] = await db.insert(users).values(user).onConflictDoUpdate({
      target: users.id,
      set: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        updatedAt: new Date(),
      },
    }).returning();
    return updatedUser[0];
  },
}