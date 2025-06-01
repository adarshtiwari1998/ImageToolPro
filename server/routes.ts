import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertImageJobSchema, insertToolUsageSchema } from "@shared/schema";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import Stripe from "stripe";

// Stripe will be initialized when keys are available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, WebP, and SVG are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tool usage tracking (public endpoint)
  app.post('/api/track-usage', async (req, res) => {
    try {
      const data = insertToolUsageSchema.parse(req.body);
      
      // Add session and request info
      const usageData = {
        ...data,
        sessionId: req.sessionID,
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
      };

      await storage.recordToolUsage(usageData);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking usage:", error);
      res.status(400).json({ message: "Failed to track usage" });
    }
  });

  // Image processing endpoints
  app.post('/api/compress-image', upload.array('images', 40), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const userId = req.user?.claims?.sub;
      const quality = parseInt(req.body.quality) || 80;
      
      // Check premium limits for batch processing
      if (!req.user?.isPremium && files.length > 1) {
        return res.status(403).json({ message: 'Batch processing requires Premium subscription' });
      }

      const results = [];

      for (const file of files) {
        const originalSize = file.size;
        const outputPath = `processed/${crypto.randomUUID()}.jpg`;
        
        // Create job record
        const job = await storage.createImageJob({
          userId: userId || null,
          toolType: 'compress',
          fileName: file.originalname,
          originalSize,
          status: 'processing',
        });

        try {
          // Process image with Sharp
          const processedBuffer = await sharp(file.path)
            .jpeg({ quality })
            .toBuffer();

          // Save processed file
          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await fs.writeFile(outputPath, processedBuffer);

          const processedSize = processedBuffer.length;
          const compressionRatio = ((originalSize - processedSize) / originalSize) * 100;

          // Update job with results
          const completedJob = await storage.updateImageJob(job.id, {
            processedSize,
            compressionRatio,
            status: 'completed',
            downloadUrl: `/api/download/${job.id}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });

          results.push(completedJob);

          // Clean up uploaded file
          await fs.unlink(file.path);

        } catch (error) {
          await storage.updateImageJob(job.id, { status: 'failed' });
          console.error('Image processing error:', error);
        }
      }

      res.json({ jobs: results });
    } catch (error) {
      console.error('Compress image error:', error);
      res.status(500).json({ message: 'Image compression failed' });
    }
  });

  app.post('/api/resize-image', upload.array('images', 40), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const userId = req.user?.claims?.sub;
      const { width, height, maintainAspectRatio } = req.body;
      
      if (!req.user?.isPremium && files.length > 1) {
        return res.status(403).json({ message: 'Batch processing requires Premium subscription' });
      }

      const results = [];

      for (const file of files) {
        const originalSize = file.size;
        const outputPath = `processed/${crypto.randomUUID()}.jpg`;
        
        const job = await storage.createImageJob({
          userId: userId || null,
          toolType: 'resize',
          fileName: file.originalname,
          originalSize,
          status: 'processing',
        });

        try {
          let resizeOptions: any = {};
          
          if (maintainAspectRatio === 'true') {
            resizeOptions = { width: parseInt(width), height: parseInt(height), fit: 'inside' };
          } else {
            resizeOptions = { width: parseInt(width), height: parseInt(height), fit: 'fill' };
          }

          const processedBuffer = await sharp(file.path)
            .resize(resizeOptions)
            .jpeg({ quality: 90 })
            .toBuffer();

          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await fs.writeFile(outputPath, processedBuffer);

          const processedSize = processedBuffer.length;

          const completedJob = await storage.updateImageJob(job.id, {
            processedSize,
            status: 'completed',
            downloadUrl: `/api/download/${job.id}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });

          results.push(completedJob);
          await fs.unlink(file.path);

        } catch (error) {
          await storage.updateImageJob(job.id, { status: 'failed' });
          console.error('Image resize error:', error);
        }
      }

      res.json({ jobs: results });
    } catch (error) {
      console.error('Resize image error:', error);
      res.status(500).json({ message: 'Image resize failed' });
    }
  });

  // Download processed files
  app.get('/api/download/:jobId', async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getImageJob(jobId);

      if (!job || job.status !== 'completed') {
        return res.status(404).json({ message: 'File not found or not ready' });
      }

      if (job.expiresAt && new Date() > job.expiresAt) {
        return res.status(410).json({ message: 'File has expired' });
      }

      const filePath = job.downloadUrl?.replace('/api/download/', 'processed/');
      if (!filePath) {
        return res.status(404).json({ message: 'File path not found' });
      }

      res.download(filePath, job.fileName);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Download failed' });
    }
  });

  // User's image history
  app.get('/api/my-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobs = await storage.getUserImageJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error('Get images error:', error);
      res.status(500).json({ message: 'Failed to fetch images' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isPremium) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const [activeUsers, totalImages, popularTools, premiumUsers] = await Promise.all([
        storage.getActiveUsers(),
        storage.getTotalProcessedImages(),
        storage.getPopularTools(),
        storage.getPremiumUsers(),
      ]);

      res.json({
        activeUsers,
        totalImages,
        popularTools,
        premiumUsers,
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/admin/tool-usage', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isPremium) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { toolType, startDate, endDate } = req.query;
      const stats = await storage.getToolUsageStats(
        toolType as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(stats);
    } catch (error) {
      console.error('Tool usage stats error:', error);
      res.status(500).json({ message: 'Failed to fetch tool usage stats' });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing not configured" });
    }
    
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.email) {
        return res.status(400).json({ message: 'User email required' });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = subscription.latest_invoice;
        const clientSecret = typeof invoice === 'object' && invoice?.payment_intent 
          ? (typeof invoice.payment_intent === 'object' ? invoice.payment_intent.client_secret : null)
          : null;
          
        return res.json({
          subscriptionId: subscription.id,
          clientSecret,
        });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890',
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      const invoice = subscription.latest_invoice;
      const clientSecret = typeof invoice === 'object' && invoice?.payment_intent 
        ? (typeof invoice.payment_intent === 'object' ? invoice.payment_intent.client_secret : null)
        : null;

      res.json({
        subscriptionId: subscription.id,
        clientSecret,
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  // Webhook for Stripe events
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing not configured" });
    }
    
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send('Webhook Error');
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      // Update user premium status based on subscription status
      // Implementation depends on how you store the customer-user mapping
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
