import { AppError, AuthenticationError } from '../utils/errors.js';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new AuthenticationError('You are not logged in');
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AuthenticationError('Password changed recently, please log in again');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
};