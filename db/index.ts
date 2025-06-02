import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 300000, // 5 minutes
  connectionTimeoutMillis: 10000, // 10 seconds
  query_timeout: 10000, // 10 seconds
  statement_timeout: 10000, // 10 seconds
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
export { pool };

import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { users } from "@shared/schema";

export const imageJobs = pgTable("image_jobs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  toolType: text("tool_type").notNull(),
  fileName: text("file_name").notNull(),
  originalSize: integer("original_size").notNull(),
  processedSize: integer("processed_size"),
  compressionRatio: real("compression_ratio"),
  status: text("status").notNull().default("processing"),
  downloadUrl: text("download_url"),
  downloadToken: text("download_token"),
  filePath: text("file_path"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});