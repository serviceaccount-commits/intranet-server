import { Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import { TYPES } from '../../../../shared/config/containerTypes';
import { AuthService } from '../services/auth.service';
import { JwtUserPayload } from '../types/jwtUserPayload.interface';
import appConfig from '../../../../shared/config/appConfig';
import { logger } from '../../../../shared/utils/logger';

let authService: AuthService;

const ACCESS_TOKEN_MAX_AGE = 20 * 60 * 1000; // 20 minutes
const REFRESH_TOKEN_MAX_AGE = 1 * 24 * 60 * 60 * 1000; // 1 day
const IS_PRODUCTION = appConfig.environment === 'production';

const COOKIE_OPTION_BASE = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'lax' as const,
};

export const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTION_BASE,
  maxAge: ACCESS_TOKEN_MAX_AGE,
};

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTION_BASE,
  maxAge: REFRESH_TOKEN_MAX_AGE,
};

const setNewTokens = (
  res: Response,
  authService: AuthService,
  payload: JwtUserPayload,
) => {
  const accessToken = authService.generateAccessToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);

  res.cookie('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
};

const renewRefreshToken = (
  res: Response,
  authService: AuthService,
  payload: JwtUserPayload,
) => {
  const newRefreshToken = authService.generateRefreshToken(payload);
  res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', { ...ACCESS_TOKEN_COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('refreshToken', {
    ...REFRESH_TOKEN_COOKIE_OPTIONS,
    maxAge: 0,
  });
};
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!authService) {
    authService = container.get(TYPES.AuthService);
  }
  if (res.headersSent) {
    logger.debug('HEADERS ALREADY SENT at middleware start!');
    return;
  } // Early check

  const accessToken = req.cookies['accessToken'];
  const refreshToken = req.cookies['refreshToken'];

  // 1. Check Access Token
  if (accessToken) {
    try {
      const accessPayload = (await authService.verifyToken(
        accessToken,
      )) as JwtUserPayload | null;
      if (accessPayload) {
        req.user = accessPayload;
        // Check before potentially modifying headers in renewRefreshToken
        if (res.headersSent) {
          logger.debug('HEADERS ALREADY SENT before renewRefreshToken!');
        }
        renewRefreshToken(res, authService, accessPayload);
        if (res.headersSent) {
          logger.debug(
            'HEADERS ALREADY SENT before next() after valid access!',
          );
        }
        return next();
      }
    } catch (error: any) {
    }
  }

  // 2. Try Refresh Token
  if (refreshToken) {
    try {
      const refreshPayload = (await authService.verifyToken(
        refreshToken,
      )) as JwtUserPayload | null;
      if (refreshPayload) {
        // Check before potentially modifying headers in setNewTokens
        if (res.headersSent) {
          logger.debug('HEADERS ALREADY SENT before setNewTokens!');
        }
        setNewTokens(res, authService, refreshPayload);
        req.user = refreshPayload;
        if (res.headersSent) {
          logger.debug('HEADERS ALREADY SENT before next() after refresh!');
        }
        return next();
      } else {
        if (res.headersSent) {
          logger.debug(
            'HEADERS ALREADY SENT before clearing cookies (invalid refresh)!',
          );
        }
        clearAuthCookies(res);
        if (res.headersSent) {
          logger.debug(
            'HEADERS ALREADY SENT before sending 401 (invalid refresh)!',
          );
        }
        res
          .status(401)
          .json({ message: 'Session expired. Please log in again.' });
        return;
      }
    } catch (error: any) {
      logger.error('Error VERIFYING Refresh Token:', error.message);
      if (res.headersSent) {
        logger.debug(
          'HEADERS ALREADY SENT before clearing cookies (refresh error)!',
        );
      }
      clearAuthCookies(res);
      if (res.headersSent) {
        logger.debug(
          'HEADERS ALREADY SENT before sending 401 (refresh error)!',
        );
      }
      res
        .status(401)
        .json({ message: 'Authentication failed. Please log in again.' });
      return;
    }
  }

  // 3. No valid tokens found
  if (res.headersSent) {
    logger.debug('HEADERS ALREADY SENT before sending final 401!');
  } // Check specifically here
  res.status(401).json({ message: 'Unauthorized: Authentication required.' });
  return;
};
