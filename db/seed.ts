
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { 
  users, 
  sessions, 
  imageJobs, 
  toolUsage, 
  subscriptionPlans,
  uploadSessions,
  fileUploads,
  processingJobs,
  downloadSessions
} from '../shared/schema';

// Database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { 
  schema: { 
    users, 
    sessions, 
    imageJobs, 
    toolUsage, 
    subscriptionPlans,
    uploadSessions,
    fileUploads,
    processingJobs,
    downloadSessions
  } 
});

async function createTables() {
  console.log('🔨 Creating tables...');
  
  // Create sessions table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sessions (
      sid varchar PRIMARY KEY,
      sess jsonb NOT NULL,
      expire timestamp NOT NULL
    )
  `);
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire)
  `);

  // Create users table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id varchar PRIMARY KEY,
      email varchar NOT NULL UNIQUE,
      password varchar NOT NULL,
      first_name varchar,
      last_name varchar,
      profile_image_url varchar,
      is_premium boolean DEFAULT false,
      stripe_customer_id varchar,
      stripe_subscription_id varchar,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )
  `);

  // Create subscription_plans table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id serial PRIMARY KEY,
      name varchar NOT NULL,
      stripe_price_id varchar NOT NULL,
      price real NOT NULL,
      interval varchar NOT NULL,
      features jsonb NOT NULL,
      is_active boolean DEFAULT true,
      created_at timestamp DEFAULT now()
    )
  `);

  // Create upload_sessions table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS upload_sessions (
      id varchar PRIMARY KEY,
      user_id varchar,
      session_token varchar NOT NULL UNIQUE,
      ip_address varchar,
      user_agent text,
      expires_at timestamp NOT NULL,
      created_at timestamp DEFAULT now()
    )
  `);

  // Create file_uploads table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS file_uploads (
      id serial PRIMARY KEY,
      session_id varchar NOT NULL,
      original_file_name varchar NOT NULL,
      file_size integer NOT NULL,
      mime_type varchar NOT NULL,
      file_hash varchar NOT NULL,
      storage_path varchar NOT NULL,
      status varchar DEFAULT 'uploaded',
      created_at timestamp DEFAULT now()
    )
  `);

  // Create image_jobs table with all required columns
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS image_jobs (
      id serial PRIMARY KEY,
      user_id varchar,
      tool_type varchar NOT NULL,
      file_name varchar NOT NULL,
      original_size integer,
      processed_size integer,
      compression_ratio real,
      processing_time integer,
      status varchar DEFAULT 'pending',
      download_url varchar,
      download_token varchar,
      file_path varchar,
      expires_at timestamp,
      created_at timestamp DEFAULT now()
    )
  `);

  // Add missing columns if they don't exist
  await db.execute(sql`
    ALTER TABLE image_jobs 
    ADD COLUMN IF NOT EXISTS download_token varchar,
    ADD COLUMN IF NOT EXISTS file_path varchar
  `)
  `);

  // Create tool_usage table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tool_usage (
      id serial PRIMARY KEY,
      tool_type varchar NOT NULL,
      user_id varchar,
      session_id varchar,
      user_agent text,
      ip_address varchar,
      created_at timestamp DEFAULT now()
    )
  `);

  // Create processing_jobs table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS processing_jobs (
      id serial PRIMARY KEY,
      session_id varchar NOT NULL,
      file_upload_id integer NOT NULL,
      tool_type varchar NOT NULL,
      settings jsonb NOT NULL,
      status varchar DEFAULT 'queued',
      processed_file_size integer,
      compression_ratio real,
      processing_time integer,
      output_path varchar,
      download_token varchar UNIQUE,
      error_message text,
      started_at timestamp,
      completed_at timestamp,
      created_at timestamp DEFAULT now()
    )
  `);

  // Create download_sessions table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS download_sessions (
      id serial PRIMARY KEY,
      session_id varchar NOT NULL,
      download_token varchar NOT NULL UNIQUE,
      download_count integer DEFAULT 0,
      max_downloads integer DEFAULT 3,
      expires_at timestamp NOT NULL,
      last_download_at timestamp,
      created_at timestamp DEFAULT now()
    )
  `);

  // Add foreign key constraints
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'upload_sessions_user_id_users_id_fk'
      ) THEN
        ALTER TABLE upload_sessions 
        ADD CONSTRAINT upload_sessions_user_id_users_id_fk 
        FOREIGN KEY (user_id) REFERENCES users(id);
      END IF;
    END $$
  `);

  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'file_uploads_session_id_upload_sessions_id_fk'
      ) THEN
        ALTER TABLE file_uploads 
        ADD CONSTRAINT file_uploads_session_id_upload_sessions_id_fk 
        FOREIGN KEY (session_id) REFERENCES upload_sessions(id);
      END IF;
    END $$
  `);

  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'image_jobs_user_id_users_id_fk'
      ) THEN
        ALTER TABLE image_jobs 
        ADD CONSTRAINT image_jobs_user_id_users_id_fk 
        FOREIGN KEY (user_id) REFERENCES users(id);
      END IF;
    END $$
  `);

  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tool_usage_user_id_users_id_fk'
      ) THEN
        ALTER TABLE tool_usage 
        ADD CONSTRAINT tool_usage_user_id_users_id_fk 
        FOREIGN KEY (user_id) REFERENCES users(id);
      END IF;
    END $$
  `);

  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'processing_jobs_session_id_upload_sessions_id_fk'
      ) THEN
        ALTER TABLE processing_jobs 
        ADD CONSTRAINT processing_jobs_session_id_upload_sessions_id_fk 
        FOREIGN KEY (session_id) REFERENCES upload_sessions(id);
      END IF;
    END $$
  `);

  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'processing_jobs_file_upload_id_file_uploads_id_fk'
      ) THEN
        ALTER TABLE processing_jobs 
        ADD CONSTRAINT processing_jobs_file_upload_id_file_uploads_id_fk 
        FOREIGN KEY (file_upload_id) REFERENCES file_uploads(id);
      END IF;
    END $$
  `);

  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'download_sessions_session_id_upload_sessions_id_fk'
      ) THEN
        ALTER TABLE download_sessions 
        ADD CONSTRAINT download_sessions_session_id_upload_sessions_id_fk 
        FOREIGN KEY (session_id) REFERENCES upload_sessions(id);
      END IF;
    END $$
  `);

  console.log('✅ Tables created successfully!');
}

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // First create all tables
    await createTables();

    // Create subscription plans
    console.log('Creating subscription plans...');
    await db.insert(subscriptionPlans).values([
      {
        name: 'Premium Monthly',
        stripePriceId: 'price_premium_monthly',
        price: 9.99,
        interval: 'month',
        features: [
          'Unlimited image processing',
          'Batch processing',
          'No ads',
          'Priority support',
          'Advanced tools',
          'Higher quality outputs'
        ],
        isActive: true
      },
      {
        name: 'Premium Yearly',
        stripePriceId: 'price_premium_yearly',
        price: 99.99,
        interval: 'year',
        features: [
          'Unlimited image processing',
          'Batch processing',
          'No ads',
          'Priority support',
          'Advanced tools',
          'Higher quality outputs',
          '2 months free'
        ],
        isActive: true
      }
    ]).onConflictDoNothing();

    console.log('✅ Database seed completed successfully!');
    
    // Close the connection
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the seed function
seed();
