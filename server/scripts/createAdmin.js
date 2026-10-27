import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env, validateEnv } from '../config/env.js';
import { User } from '../models/User.js';

async function createAdmin() {
  validateEnv();
  const name = process.env.ADMIN_NAME || env.seedAdmin.name;
  const email = (process.env.ADMIN_EMAIL || env.seedAdmin.email).toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || env.seedAdmin.password;

  if (!email || !password || password.length < 10) {
    throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 10 characters.');
  }

  await connectDatabase();

  let user = await User.findOne({ email });
  if (user) {
    user.name = name;
    user.role = 'admin';
    user.status = 'active';
    user.passwordHash = await User.hashPassword(password);
    await user.save();
    console.log(`[admin] Updated existing account as administrator: ${email}`);
  } else {
    user = await User.create({
      name,
      email,
      passwordHash: await User.hashPassword(password),
      college: 'UniMarket Campus Team',
      department: 'Platform moderation',
      role: 'admin',
      status: 'active',
    });
    console.log(`[admin] Administrator created: ${email}`);
  }

  console.log('[admin] Password was not printed. Store it securely.');
}

createAdmin()
  .catch((error) => {
    console.error('[admin] Failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
