import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserPayload, AuthTokens } from '../types/auth.types';

export class JwtUtils {
  static generateTokens(payload: UserPayload): AuthTokens {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    // Parse expiresIn to get actual expiration time in seconds
    const expiresInMatch = env.JWT_EXPIRES_IN.match(/(\d+)([mhd])/);
    let expiresIn = 900; // Default 15 minutes
    
    if (expiresInMatch) {
      const value = parseInt(expiresInMatch[1]);
      const unit = expiresInMatch[2];
      switch (unit) {
        case 'm': expiresIn = value * 60; break;
        case 'h': expiresIn = value * 3600; break;
        case 'd': expiresIn = value * 86400; break;
      }
    }

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  static verifyAccessToken(token: string): UserPayload {
    return jwt.verify(token, env.JWT_SECRET) as UserPayload;
  }

  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
  }

  static decodeToken(token: string): UserPayload | null {
    try {
      return jwt.decode(token) as UserPayload;
    } catch {
      return null;
    }
  }
}
