import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
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

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create subscription plans
    console.log('Creating subscription plans...');
    await db.insert(subscriptionPlans).values([
      {
        name: 'Premium Monthly',
        stripePriceId: 'price_premium_monthly', // Replace with actual Stripe price ID
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
        stripePriceId: 'price_premium_yearly', // Replace with actual Stripe price ID
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