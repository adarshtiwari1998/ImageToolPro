import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isPremium: boolean("is_premium").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Image processing jobs
export const imageJobs = pgTable("image_jobs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  toolType: varchar("tool_type").notNull(), // compress, resize, crop, etc.
  fileName: varchar("file_name").notNull(),
  originalSize: integer("original_size"),
  processedSize: integer("processed_size"),
  compressionRatio: real("compression_ratio"),
  processingTime: integer("processing_time"), // in milliseconds
  status: varchar("status").default("pending"), // pending, processing, completed, failed
  downloadUrl: varchar("download_url"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tool usage analytics
export const toolUsage = pgTable("tool_usage", {
  id: serial("id").primaryKey(),
  toolType: varchar("tool_type").notNull(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  stripePriceId: varchar("stripe_price_id").notNull(),
  price: real("price").notNull(),
  interval: varchar("interval").notNull(), // month, year
  features: jsonb("features").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ImageJob = typeof imageJobs.$inferSelect;
export type InsertImageJob = typeof imageJobs.$inferInsert;
export type ToolUsage = typeof toolUsage.$inferSelect;
export type InsertToolUsage = typeof toolUsage.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const insertImageJobSchema = createInsertSchema(imageJobs).omit({
  id: true,
  createdAt: true,
});

export const insertToolUsageSchema = createInsertSchema(toolUsage).omit({
  id: true,
  createdAt: true,
});

export type InsertImageJobData = z.infer<typeof insertImageJobSchema>;
export type InsertToolUsageData = z.infer<typeof insertToolUsageSchema>;
