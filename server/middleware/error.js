import { env } from '../config/env.js';
import { removeUploadedFiles } from './upload.js';

export function respondError(res, statusCode, message, options = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    code: options.code,
    errors: options.errors || undefined,
  });
}

export function notFoundHandler(req, res) {
  return respondError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`, {
    code: 'NOT_FOUND',
  });
}

export function errorHandler(error, req, res, _next) {
  if (req.files?.length) removeUploadedFiles(req.files);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong.';
  let code = error.code || 'INTERNAL_ERROR';
  let errors = error.details || undefined;

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier.';
    code = 'CAST_ERROR';
  }

  if (error.name === 'ValidationError' && error.errors) {
    statusCode = 422;
    message = 'Please check the highlighted fields and try again.';
    code = 'VALIDATION_ERROR';
    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (error.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(error.keyValue || {})[0];
    message = field === 'email'
      ? 'An account with this email already exists.'
      : 'This record already exists.';
  }

  if (error.name === 'MulterError') {
    statusCode = 422;
    code = 'UPLOAD_ERROR';
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = `Each image must be smaller than ${env.maxImageSizeMb} MB.`;
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      message = `You can upload up to ${env.maxImagesPerListing} images.`;
    } else {
      message = 'The image upload could not be completed.';
    }
  }

  if (!error.expose && statusCode === 500) {
    message = 'Something went wrong on our side. Please try again.';
  }

  if (statusCode >= 500 && !env.isTest) {
    console.error('[api:error]', {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      stack: error.stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code,
    errors,
  });
}
