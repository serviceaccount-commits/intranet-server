import { logger } from '../../../../shared/utils/logger';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import appConfig from '../../../../shared/config/appConfig';

const ADMIN_API_KEY = appConfig.internalAdminApiKey;

export const verifyAdminApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!ADMIN_API_KEY) {
    logger.error('INTERNAL_ADMIN_API_KEY is not set in environment variables.');
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  const clientApiKey = req.header('X-API-Key');

  if (!clientApiKey) {
    res.status(401).json({ message: 'Unauthorized: API key is missing.' });
    return;
  }

  if (clientApiKey.length !== ADMIN_API_KEY.length) {
    res.status(401).json({ message: 'Unauthorized: Invalid API key.' });
    return;
  }

  const isVerified = crypto.timingSafeEqual(
    Buffer.from(clientApiKey),
    Buffer.from(ADMIN_API_KEY),
  );

  if (isVerified) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Invalid API key.' });
    return;
  }
};
