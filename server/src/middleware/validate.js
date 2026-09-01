import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return next(new AppError(messages.join('; '), 400));
    }
    return next(new AppError('Validation failed', 400));
  }
};

export const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = schema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return next(new AppError(messages.join('; '), 400));
    }
    return next(new AppError('Invalid parameters', 400));
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return next(new AppError(messages.join('; '), 400));
    }
    return next(new AppError('Invalid query parameters', 400));
  }
};