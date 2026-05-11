import { logger } from '../../../../shared/utils/logger';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../../shared/config/containerTypes';
import { AuthService } from '../services/auth.service';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService,
  ) {}

  // public async login(req: Request, res: Response) {}

  public async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    try {
      const payload = this.authService.verifyToken(refreshToken); //
      if (!payload) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
        return res
          .status(403)
          .json({ message: 'Invalid or expired refresh token' });
      }
      const newAccessTokenPayload = {
        id: payload.id,
        username: payload.username,
        permissions: payload.permissions,
      };
      const newAccessToken = this.authService.generateAccessToken(
        newAccessTokenPayload,
      );

      const accessTokenMaxAge = 20 * 60 * 1000; // 20 minutes

      // 4. Set the new access token in the cookie
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: accessTokenMaxAge,
        sameSite: 'none',
      });

      res.status(200).json({ message: 'Access token refreshed' });
    } catch (error) {
      logger.error('Error refreshing token:', error);

      res.status(500).json({ message: 'Could not refresh token' });
    }
  }

  public async logout(_req: Request, res: Response) {
    res.status(200).json({ message: 'Logged out successfully' });
  }
}
