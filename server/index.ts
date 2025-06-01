
import express from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupVite, serveStatic } from "./vite";
import { createRoutes } from "./routes";
import session from "express-session";
import connectPg from "connect-pg-simple";

export function createApp(): Express {
  const app = express();
  app.set("trust proxy", 1);

  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL + "?sslmode=require",
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  return app;
}

export function setupApp(app: Express, server: Server) {
  createRoutes(app);

  if (process.env.NODE_ENV === "development") {
    setupVite(app, server);
  } else {
    serveStatic(app);
  }
}

if (import.meta.main) {
  const app = createApp();
  const server = createServer(app);

  setupApp(app, server);

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    const formattedTime = new Intl.DateTimeFormat("en", {
      timeStyle: "medium",
      timeZone: "UTC",
    }).format(new Date());

    console.log(`[${formattedTime} UTC] Server running on http://0.0.0.0:${port}`);
  });
}
