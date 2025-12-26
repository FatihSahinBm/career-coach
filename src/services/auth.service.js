import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { sanitizeInput } from '../utils/sanitizer.js';

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Register new user
 */
export async function registerUser(email, password, name) {
  // Sanitize inputs
  email = sanitizeInput(email).toLowerCase();
  name = sanitizeInput(name);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  });

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user.id);

  return {
    user,
    accessToken,
    refreshToken
  };
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  email = sanitizeInput(email).toLowerCase();

  // Find user
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null
    }
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    accessToken,
    refreshToken
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists in DB
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        deletedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!tokenRecord) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { accessToken };
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AppError('Invalid refresh token', 401);
    }
    throw error;
  }
}

/**
 * Logout user (invalidate refresh token)
 */
export async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return { success: true };
  }

  // Soft delete the refresh token
  await prisma.refreshToken.updateMany({
    where: {
      token: refreshToken,
      deletedAt: null
    },
    data: {
      deletedAt: new Date()
    }
  });

  return { success: true };
}

/**
 * Generate access and refresh tokens
 */
async function generateTokens(userId) {
  // Generate access token
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt
    }
  });

  return { accessToken, refreshToken };
}

/**
 * Clean up expired refresh tokens (should be run periodically)
 */
export async function cleanupExpiredTokens() {
  await prisma.refreshToken.updateMany({
    where: {
      expiresAt: {
        lt: new Date()
      },
      deletedAt: null
    },
    data: {
      deletedAt: new Date()
    }
  });
}
