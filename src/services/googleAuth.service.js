import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../middleware/errorHandler.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class GoogleAuthService {
  /**
   * Verify Google ID Token
   * @param {string} token - The ID token from the frontend
   * @returns {Promise<Object>} - The user's profile information
   */
  async verifyToken(token) {
    try {
      // 1. Try to verify as ID Token (JWT) first (Fast & Local)
      // ID Tokens have 3 parts separated by dots
      if (token.split('.').length === 3) {
          const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          return {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            googleId: payload.sub
          };
      } else {
         // 2. Treat as Access Token (Fetch from Google UserInfo)
         const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
             headers: { Authorization: `Bearer ${token}` }
         });
         
         if (!res.ok) {
             throw new Error(`Google UserInfo Error: ${res.status}`);
         }
         
         const payload = await res.json();
         return {
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            googleId: payload.sub
         };
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      throw new AppError('Invalid Google Token', 401);
    }
  }
}

export default new GoogleAuthService();
