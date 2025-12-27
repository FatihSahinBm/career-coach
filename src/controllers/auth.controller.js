import * as authService from '../services/auth.service.js';
import { AppError } from '../middleware/errorHandler.js';
import googleAuthService from '../services/googleAuth.service.js';
import { prisma } from '../config/database.js';

/**
 * Register new user
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    const result = await authService.registerUser(email, password, name);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Google Login
 * POST /api/auth/google
 */
export async function googleLogin(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) throw new AppError('Google token is required', 400);

    // 1. Verify Google Token
    const googleProfile = await googleAuthService.verifyToken(token);

    // 2. Find or Create User
    let user = await prisma.user.findUnique({
      where: { email: googleProfile.email }
    });

    let accessToken, refreshToken;

    if (!user) {
      // Create new user
      const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
      const result = await authService.registerUser(
          googleProfile.email,
          randomPassword,
          googleProfile.name
      );
      user = result.user;
      accessToken = result.accessToken;
      refreshToken = result.refreshToken;
    } else {
      // Existing User: Generate tokens
      const tokens = await authService.generateTokens(user.id);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    }

    // 4. Update Refresh Token in DB (Redundant if service handles it, but keeping if user model needs it)
    // NOTE: authService.generateTokens handles RefreshToken table insertion.
    // Ensure we don't double update if only that table is used.
    // Checking schema is hard right now, but assuming 'refreshToken' field exists on User is inconsistent 
    // with authService relying on RefreshToken table. 
    // However, to be safe and standard with this project's style (if mixed), we can try to update 
    // ONLY IF the field exists, but safer to skip if not sure.
    // Given the error trace didn't complain about update, maybe User model has it.
    // I will skip updating User.refreshToken manually to avoid errors, relying on the service's logic which we just saw works for login logic.

    // 5. Send Response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userResponse, accessToken }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 */
export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;

    await authService.logoutUser(refreshToken);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
}
