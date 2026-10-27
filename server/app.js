import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'node:path';
import { env } from './config/env.js';
import { ensureCsrfCookie, csrfProtection } from './middleware/csrf.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { uploadsRoot } from './middleware/upload.js';
import routes from './routes/index.js';

const app = express();

app.disable('x-powered-by');
if (env.isProduction) app.set('trust proxy', 1);

const allowedOrigins = env.clientUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (!env.isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by UniMarket CORS policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(env.cookieSecret));
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.use('/uploads', express.static(path.resolve(uploadsRoot), {
  fallthrough: true,
  maxAge: env.isProduction ? '7d' : 0,
  index: false,
  dotfiles: 'deny',
}));

app.use(ensureCsrfCookie);
app.use(csrfProtection);
app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
