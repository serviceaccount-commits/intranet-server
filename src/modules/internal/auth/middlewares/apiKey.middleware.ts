import { logger } from '../../../../shared/utils/logger';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import appConfig from '../../../../shared/config/appConfig';

const API_KEY = appConfig.internalApiKey;

export const verifyApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!API_KEY) {
    // This is a server configuration error, not a client error.
    logger.error('INTERNAL_API_KEY is not set in environment variables.');
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  const clientApiKey = req.header('X-API-Key');

  if (!clientApiKey) {
    res.status(401).json({ message: 'Unauthorized: API key is missing.' });
    return;
  }

  if (clientApiKey.length !== API_KEY.length) {
    res.status(401).json({ message: 'Unauthorized: Invalid API key.' });
    return;
  }

  // Use crypto.timingSafeEqual to prevent timing attacks
  const isVerified = crypto.timingSafeEqual(
    Buffer.from(clientApiKey),
    Buffer.from(API_KEY),
  );

  if (isVerified) {
    next(); // Key is valid, proceed to the route handler.
  } else {
    res.status(401).json({ message: 'Unauthorized: Invalid API key.' });
    return;
  }
};
