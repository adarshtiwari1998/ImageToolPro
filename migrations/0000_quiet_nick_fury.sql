CREATE TABLE "download_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar NOT NULL,
	"download_token" varchar NOT NULL,
	"download_count" integer DEFAULT 0,
	"max_downloads" integer DEFAULT 3,
	"expires_at" timestamp NOT NULL,
	"last_download_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "download_sessions_download_token_unique" UNIQUE("download_token")
);
--> statement-breakpoint
CREATE TABLE "file_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar NOT NULL,
	"original_file_name" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar NOT NULL,
	"file_hash" varchar NOT NULL,
	"storage_path" varchar NOT NULL,
	"status" varchar DEFAULT 'uploaded',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "image_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"tool_type" varchar NOT NULL,
	"file_name" varchar NOT NULL,
	"original_size" integer,
	"processed_size" integer,
	"compression_ratio" real,
	"processing_time" integer,
	"status" varchar DEFAULT 'pending',
	"download_url" varchar,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "processing_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar NOT NULL,
	"file_upload_id" integer NOT NULL,
	"tool_type" varchar NOT NULL,
	"settings" jsonb NOT NULL,
	"status" varchar DEFAULT 'queued',
	"processed_file_size" integer,
	"compression_ratio" real,
	"processing_time" integer,
	"output_path" varchar,
	"download_token" varchar,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "processing_jobs_download_token_unique" UNIQUE("download_token")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"stripe_price_id" varchar NOT NULL,
	"price" real NOT NULL,
	"interval" varchar NOT NULL,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tool_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_type" varchar NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"user_agent" text,
	"ip_address" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "upload_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"session_token" varchar NOT NULL,
	"ip_address" varchar,
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "upload_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"is_premium" boolean DEFAULT false,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "download_sessions" ADD CONSTRAINT "download_sessions_session_id_upload_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."upload_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_session_id_upload_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."upload_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_jobs" ADD CONSTRAINT "image_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_session_id_upload_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."upload_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processing_jobs" ADD CONSTRAINT "processing_jobs_file_upload_id_file_uploads_id_fk" FOREIGN KEY ("file_upload_id") REFERENCES "public"."file_uploads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_usage" ADD CONSTRAINT "tool_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");