import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export function validate(rules) {
  return [
    ...rules,
    (req, _res, next) => {
      const result = validationResult(req);
      if (result.isEmpty()) return next();

      const details = result.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }));

      return next(
        new ApiError(422, 'Please check the highlighted fields and try again.', {
          code: 'VALIDATION_ERROR',
          details,
        })
      );
    },
  ];
}
