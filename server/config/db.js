import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer = null;

export async function connectDatabase(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      autoIndex: !env.isProduction,
    });
    const { host, name } = mongoose.connection;
    console.log(`[db] Connected to MongoDB at ${host}/${name}`);
    return mongoose.connection;
  } catch (error) {
    if (!env.isProduction && (error.name === 'MongooseServerSelectionError' || error.message.includes('ECONNREFUSED'))) {
      console.warn(`[db] Could not connect to local MongoDB at ${uri}.`);
      console.log('[db] Starting embedded MongoMemoryServer on port 27017 for MongoDB Compass compatibility...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      let memoryUri;
      try {
        memoryServer = await MongoMemoryServer.create({
          instance: { port: 27017, dbName: 'unimarket' },
        });
        memoryUri = memoryServer.getUri('unimarket');
      } catch (portErr) {
        console.warn(`[db] Port 27017 in use (${portErr.message}), allocating dynamic port.`);
        memoryServer = await MongoMemoryServer.create({
          instance: { dbName: 'unimarket' },
        });
        memoryUri = memoryServer.getUri('unimarket');
      }
      await mongoose.connect(memoryUri, {
        serverSelectionTimeoutMS: 10000,
        autoIndex: true,
      });
      console.log(`[db] Connected to embedded in-memory MongoDB at ${memoryUri}`);
      console.log(`[db] MongoDB Compass can now connect to: ${memoryUri}`);
      return mongoose.connection;
    }
    throw error;
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
