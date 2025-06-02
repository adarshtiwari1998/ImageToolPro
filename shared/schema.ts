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

// User storage table for custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
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
  downloadToken: varchar("download_token"), // secure download token
  filePath: varchar("file_path"), // stored file path
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

// File upload sessions - tracks user upload sessions
export const uploadSessions = pgTable("upload_sessions", {
  id: varchar("id").primaryKey(), // unique session ID like iLoveImg
  userId: varchar("user_id").references(() => users.id),
  sessionToken: varchar("session_token").notNull().unique(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// File uploads - individual files in a session
export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").references(() => uploadSessions.id).notNull(),
  originalFileName: varchar("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileHash: varchar("file_hash").notNull(), // for deduplication
  storagePath: varchar("storage_path").notNull(),
  status: varchar("status").default("uploaded"), // uploaded, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Processing jobs - what iLoveImg does in the background
export const processingJobs = pgTable("processing_jobs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").references(() => uploadSessions.id).notNull(),
  fileUploadId: integer("file_upload_id").references(() => fileUploads.id).notNull(),
  toolType: varchar("tool_type").notNull(), // compress, resize, crop, etc.
  settings: jsonb("settings").notNull(), // compression quality, resize dimensions, etc.
  status: varchar("status").default("queued"), // queued, processing, completed, failed
  processedFileSize: integer("processed_file_size"),
  compressionRatio: real("compression_ratio"),
  processingTime: integer("processing_time"), // in milliseconds
  outputPath: varchar("output_path"),
  downloadToken: varchar("download_token").unique(), // secure download token
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Download sessions - tracks file downloads
export const downloadSessions = pgTable("download_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").references(() => uploadSessions.id).notNull(),
  downloadToken: varchar("download_token").notNull().unique(),
  downloadCount: integer("download_count").default(0),
  maxDownloads: integer("max_downloads").default(3),
  expiresAt: timestamp("expires_at").notNull(),
  lastDownloadAt: timestamp("last_download_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ImageJob = typeof imageJobs.$inferSelect;
export type InsertImageJob = typeof imageJobs.$inferInsert;
export type ToolUsage = typeof toolUsage.$inferSelect;
export type InsertToolUsage = typeof toolUsage.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// New types
export type UploadSession = typeof uploadSessions.$inferSelect;
export type InsertUploadSession = typeof uploadSessions.$inferInsert;
export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;
export type ProcessingJob = typeof processingJobs.$inferSelect;
export type InsertProcessingJob = typeof processingJobs.$inferInsert;
export type DownloadSession = typeof downloadSessions.$inferSelect;
export type InsertDownloadSession = typeof downloadSessions.$inferInsert;

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