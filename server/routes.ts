import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertImageJobSchema, insertToolUsageSchema } from "@shared/schema";
import { isAuthenticated, hashPassword, verifyPassword } from "./auth";
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
  limits: { 
    fileSize: 15 * 1024 * 1024, // 15MB limit
    files: 40 // Max 40 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, WebP, and SVG are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Custom authentication routes
  app.post('/api/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const userId = crypto.randomUUID();

      const user = await storage.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      // Set user session
      (req.session as any).userId = user.id;

      // Save session explicitly
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
        }
        res.json({ 
          user: { 
            id: user.id, 
            email: user.email, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            isPremium: user.isPremium 
          } 
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Internal server error' });
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set user session
      (req.session as any).userId = user.id;

      // Save session explicitly
      req.session.save((err: any) => {
        if (err) {
          console.error('Session save error:', err);
        }
        res.json({ 
          user: { 
            id: user.id, 
            email: user.email, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            isPremium: user.isPremium 
          } 
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        isPremium: user.isPremium 
      });
    } catch (error) {
      console.error('Auth check error:', error);
      res.status(500).json({ message: 'Internal server error' });
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
      console.log('Received files:', req.files);
      console.log('Request body:', req.body);

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        console.log('No files received in request');
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const userId = req.user?.id;
      const quality = parseInt(req.body.quality) || 80;

      // Check premium limits for batch processing
      if (!req.user?.isPremium && files.length > 1) {
        return res.status(403).json({ message: 'Batch processing requires Premium subscription' });
      }

      const results = [];

      for (const file of files) {
        const originalSize = file.size;
        
        // Create job record first
        console.log('Creating job for file:', file.originalname);
        const job = await storage.createImageJob({
          userId: userId || null,
          toolType: 'compress',
          fileName: file.originalname,
          originalSize,
          status: 'processing',
        });
        console.log('Created job with ID:', job.id);

        const fileExtension = path.extname(file.originalname) || '.jpg';
        const outputFileName = `job_${job.id}_${crypto.randomUUID()}${fileExtension}`;
        const outputPath = `processed/${outputFileName}`;

        try {
          // Process image with Sharp - aggressive compression for better results
          let sharpInstance = sharp(file.path);
          
          // Get image metadata to determine original format
          const metadata = await sharpInstance.metadata();
          let processedBuffer: Buffer;
          
          // Aggressive compression settings to ensure smaller file sizes
          if (file.mimetype.includes('png')) {
            // Convert PNG to JPEG for better compression unless transparency is needed
            const hasAlpha = metadata.channels === 4;
            if (hasAlpha) {
              processedBuffer = await sharpInstance
                .png({ 
                  quality: Math.max(20, quality - 30),
                  compressionLevel: 9,
                  progressive: true,
                  palette: true
                })
                .toBuffer();
            } else {
              // Convert to JPEG for better compression
              processedBuffer = await sharpInstance
                .jpeg({ 
                  quality: Math.max(20, Math.min(quality - 20, 75)),
                  progressive: true,
                  mozjpeg: true,
                  optimizeScans: true,
                  optimizeCoding: true
                })
                .toBuffer();
            }
          } else if (file.mimetype.includes('webp')) {
            processedBuffer = await sharpInstance
              .webp({ 
                quality: Math.max(20, quality - 20),
                effort: 6,
                smartSubsample: true
              })
              .toBuffer();
          } else {
            // For JPEG and others, use aggressive compression
            processedBuffer = await sharpInstance
              .jpeg({ 
                quality: Math.max(20, Math.min(quality - 20, 75)),
                progressive: true,
                mozjpeg: true,
                optimizeScans: true,
                optimizeCoding: true
              })
              .toBuffer();
          }

          // If the compressed file is larger, try more aggressive compression
          if (processedBuffer.length >= originalSize) {
            console.log('First compression resulted in larger file, applying more aggressive compression...');
            processedBuffer = await sharp(file.path)
              .jpeg({ 
                quality: Math.max(15, 40),
                progressive: true,
                mozjpeg: true,
                optimizeScans: true,
                optimizeCoding: true
              })
              .toBuffer();
          }

          // Ensure processed directory exists and save file
          await fs.mkdir('processed', { recursive: true });
          await fs.writeFile(outputPath, processedBuffer);

          const processedSize = processedBuffer.length;
          const compressionRatio = ((originalSize - processedSize) / originalSize) * 100;

          // Generate long download token similar to iLoveImg (32 bytes = 64 hex characters)
          const downloadToken = crypto.randomBytes(32).toString('hex');
          const downloadUrl = `/download/${downloadToken}/${job.id}`;

          console.log('Generated download token:', downloadToken);
          console.log('Job ID:', job.id);
          console.log('Download URL:', downloadUrl);

          // Update job with results
          const completedJob = await storage.updateImageJob(job.id, {
            processedSize,
            compressionRatio,
            status: 'completed',
            filePath: outputFileName, // Store just the filename
            downloadToken,
            downloadUrl,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });

          console.log('Updated job:', completedJob);

          results.push(completedJob);

          // Clean up uploaded file
          await fs.unlink(file.path);

        } catch (error) {
          await storage.updateImageJob(job.id, { status: 'failed' });
          console.error('Image processing error:', error);
        }
      }

      console.log('Sending response with jobs:', results);
      res.json({ jobs: results });
    } catch (error) {
      console.error('Compress image error:', error);
      res.status(500).json({ message: 'Image compression failed' });
    }
  });

  app.post('/api/resize-image', upload.array('images', 40), async (req, res) => {
    try {
      console.log('Received resize request:', req.body);
      console.log('Received files:', req.files);

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        console.log('No files received in request');
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const userId = req.user?.id;
      const { 
        resizeMode, 
        width, 
        height, 
        percentage, 
        maintainAspectRatio, 
        doNotEnlarge,
        preserveQuality 
      } = req.body;

      console.log('Resize parameters:', { resizeMode, width, height, percentage, maintainAspectRatio, doNotEnlarge });

      // Check premium limits for batch processing
      if (!req.user?.isPremium && files.length > 1) {
        return res.status(403).json({ message: 'Batch processing requires Premium subscription' });
      }

      const results = [];

      for (const file of files) {
        const originalSize = file.size;
        
        // Create job record first
        console.log('Creating resize job for file:', file.originalname);
        const job = await storage.createImageJob({
          userId: userId || null,
          toolType: 'resize',
          fileName: file.originalname,
          originalSize,
          status: 'processing',
        });
        console.log('Created job with ID:', job.id);

        const fileExtension = path.extname(file.originalname) || '.jpg';
        const outputFileName = `job_${job.id}_${crypto.randomUUID()}${fileExtension}`;
        const outputPath = `processed/${outputFileName}`;

        try {
          let sharpInstance = sharp(file.path);
          const metadata = await sharpInstance.metadata();
          
          let resizeOptions: any = {};

          if (resizeMode === 'percentage') {
            // Resize by percentage
            const scale = parseFloat(percentage) / 100;
            const newWidth = Math.round((metadata.width || 0) * scale);
            const newHeight = Math.round((metadata.height || 0) * scale);
            
            // Check "do not enlarge" option
            if (doNotEnlarge === 'true' && scale > 1) {
              // Don't resize if it would make the image larger
              resizeOptions = {};
            } else {
              resizeOptions = { 
                width: newWidth, 
                height: newHeight,
                fit: maintainAspectRatio === 'true' ? 'inside' : 'fill'
              };
            }
          } else {
            // Resize by pixels
            const targetWidth = parseInt(width);
            const targetHeight = parseInt(height);
            
            // Check "do not enlarge" option
            if (doNotEnlarge === 'true') {
              const currentWidth = metadata.width || 0;
              const currentHeight = metadata.height || 0;
              
              if (targetWidth > currentWidth || targetHeight > currentHeight) {
                // Don't resize if target is larger than current
                resizeOptions = {};
              } else {
                resizeOptions = {
                  width: targetWidth,
                  height: targetHeight,
                  fit: maintainAspectRatio === 'true' ? 'inside' : 'fill'
                };
              }
            } else {
              resizeOptions = {
                width: targetWidth,
                height: targetHeight,
                fit: maintainAspectRatio === 'true' ? 'inside' : 'fill'
              };
            }
          }

          // Apply resize if options are set
          if (Object.keys(resizeOptions).length > 0) {
            sharpInstance = sharpInstance.resize(resizeOptions);
          }

          // Handle quality preservation based on user preference
          const useHighQuality = preserveQuality === 'true';
          let processedBuffer: Buffer;
          
          if (file.mimetype.includes('png')) {
            processedBuffer = await sharpInstance
              .png({ 
                quality: useHighQuality ? 95 : 85,
                compressionLevel: useHighQuality ? 6 : 9,
                progressive: false
              })
              .toBuffer();
          } else if (file.mimetype.includes('webp')) {
            processedBuffer = await sharpInstance
              .webp({ 
                quality: useHighQuality ? 95 : 85,
                effort: useHighQuality ? 4 : 6,
                smartSubsample: !useHighQuality
              })
              .toBuffer();
          } else {
            // For JPEG, adjust quality based on user preference
            if (useHighQuality) {
              processedBuffer = await sharpInstance
                .jpeg({ 
                  quality: 95,
                  progressive: false,
                  mozjpeg: false,
                  optimizeScans: false,
                  optimizeCoding: false
                })
                .toBuffer();
            } else {
              processedBuffer = await sharpInstance
                .jpeg({ 
                  quality: 85,
                  progressive: true,
                  mozjpeg: true,
                  optimizeScans: true,
                  optimizeCoding: true
                })
                .toBuffer();
            }
          }

          // Ensure processed directory exists and save file
          await fs.mkdir('processed', { recursive: true });
          await fs.writeFile(outputPath, processedBuffer);

          const processedSize = processedBuffer.length;
          const sizeChange = ((originalSize - processedSize) / originalSize) * 100;

          // Generate download token like compression
          const downloadToken = crypto.randomBytes(32).toString('hex');
          const downloadUrl = `/download/${downloadToken}/${job.id}`;

          console.log('Generated download token:', downloadToken);
          console.log('Job ID:', job.id);
          console.log('Download URL:', downloadUrl);

          // Update job with results
          const completedJob = await storage.updateImageJob(job.id, {
            processedSize,
            compressionRatio: sizeChange,
            status: 'completed',
            filePath: outputFileName,
            downloadToken,
            downloadUrl,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          });

          console.log('Updated resize job:', completedJob);
          results.push(completedJob);

          // Clean up uploaded file
          await fs.unlink(file.path);

        } catch (error) {
          await storage.updateImageJob(job.id, { status: 'failed' });
          console.error('Image resize error:', error);
        }
      }

      console.log('Sending resize response with jobs:', results);
      res.json({ jobs: results });
    } catch (error) {
      console.error('Resize image error:', error);
      res.status(500).json({ message: 'Image resize failed' });
    }
  });

  // Generate dynamic download URL
  app.get('/api/generate-download/:jobId', async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getImageJob(jobId);

      if (!job || job.status !== 'completed') {
        return res.status(404).json({ message: 'File not found or not ready' });
      }

      // Generate a dynamic download token (similar to iLoveImg)
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const downloadPath = `/download/${downloadToken}/${jobId}`;
      
      // Update job with download token (you might want to store this in DB)
      await storage.updateImageJob(jobId, {
        downloadToken,
        downloadUrl: downloadPath,
      });

      res.json({ downloadUrl: downloadPath });
    } catch (error) {
      console.error('Generate download URL error:', error);
      res.status(500).json({ message: 'Failed to generate download URL' });
    }
  });

  // Download processed files with dynamic URL
  app.get('/download/:token/:jobId', async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const token = req.params.token;
      const job = await storage.getImageJob(jobId);

      if (!job || job.status !== 'completed') {
        return res.status(404).json({ message: 'File not found or not ready' });
      }

      if (job.expiresAt && new Date() > job.expiresAt) {
        return res.status(410).json({ message: 'File has expired' });
      }

      // Verify token matches (basic security)
      if (job.downloadToken !== token) {
        return res.status(403).json({ message: 'Invalid download token' });
      }

      // Use the stored file path from the job
      const actualFilePath = path.join('processed', job.filePath || `job_${job.id}_default.jpg`);
      
      try {
        await fs.access(actualFilePath);
        
        // Set proper headers for automatic download like iLoveImg
        const getDownloadPrefix = (toolType: string) => {
          switch (toolType) {
            case 'compress': return 'compressed_';
            case 'resize': return 'resized_';
            case 'crop': return 'cropped_';
            case 'convert': return 'converted_';
            default: return 'processed_';
          }
        };
        
        const downloadFileName = `${getDownloadPrefix(job.toolType)}${job.fileName}`;
        const stats = await fs.stat(actualFilePath);
        
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', stats.size.toString());
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        // Stream the file for better performance
        const fileStream = await fs.readFile(actualFilePath);
        res.send(fileStream);
      } catch (fileError) {
        console.error('File not found:', actualFilePath);
        return res.status(404).json({ message: 'Processed file not found' });
      }
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Download failed' });
    }
  });

  // Get specific job details
  app.get('/api/job/:jobId', async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getImageJob(jobId);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({ message: 'Failed to fetch job details' });
    }
  });

  // User's image history
  app.get('/api/my-images', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const jobs = await storage.getUserImageJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error('Get images error:', error);
      res.status(500).json({ message: 'Failed to fetch images' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser(userId);
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

  app.get('/api/admin/tool-usage', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const user = await storage.getUser(userId);
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
  app.post('/api/create-subscription', async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ message: "Payment processing not configured" });
    }

    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
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