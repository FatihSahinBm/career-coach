import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { prisma } from '../config/database.js';

/**
 * Verify JWT access token middleware
 */
export async function authenticateToken(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and is not deleted
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      throw new AppError('User not found or deleted', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
}
