export class ApiError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = options.code || 'REQUEST_FAILED';
    this.details = options.details || null;
    this.expose = options.expose ?? statusCode < 500;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
