import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: number(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unimarket',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || '',
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  maxImageSizeMb: number(process.env.MAX_IMAGE_SIZE_MB, 5),
  maxImagesPerListing: number(process.env.MAX_IMAGES_PER_LISTING, 6),
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'UniMarket Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@unimarket.demo',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: number(process.env.SMTP_PORT, 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || '',
  },
};

export function validateEnv() {
  const problems = [];
  if (!env.jwtSecret || env.jwtSecret.length < 32) {
    problems.push('JWT_SECRET must be set and at least 32 characters long.');
  }
  if (!env.mongoUri) problems.push('MONGODB_URI must be set.');
  if (!['lax', 'strict', 'none'].includes(env.cookieSameSite)) {
    problems.push('COOKIE_SAMESITE must be one of: lax, strict, none.');
  }
  if (env.isProduction && env.cookieSameSite === 'none' && !env.clientUrl.startsWith('https://')) {
    problems.push('COOKIE_SAMESITE=none requires an HTTPS CLIENT_URL.');
  }
  if (problems.length) {
    const message = `Invalid environment configuration:\n- ${problems.join('\n- ')}`;
    throw new Error(message);
  }
}
