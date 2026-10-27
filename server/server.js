import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env, validateEnv } from './config/env.js';

import { User } from './models/User.js';
import { runSeed } from './scripts/seed.js';

async function start() {
  try {
    validateEnv();
    await connectDatabase();

    if (!env.isProduction) {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[api] Empty database detected. Auto-seeding demo data...');
        try {
          await runSeed();
        } catch (seedErr) {
          console.error('[api] Auto-seed warning:', seedErr.message);
        }
      }
    }

    const server = app.listen(env.port, () => {
      console.log(`[api] UniMarket API listening on http://localhost:${env.port}`);
      console.log(`[api] Environment: ${env.nodeEnv}`);
    });

    async function shutdown(signal) {
      console.log(`\n[api] ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000).unref();
    }

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[api] Failed to start:', error.message);
    process.exit(1);
  }
}

start();
