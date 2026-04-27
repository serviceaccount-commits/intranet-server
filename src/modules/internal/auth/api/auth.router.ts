import { logger } from '../../../../shared/utils/logger';
import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../../shared/config/inversify.config';
import passport from 'passport';
import appConfig from '../../../../shared/config/appConfig';
import { AuthController } from '../controllers/auth.controller';
import { TYPES } from '../../../../shared/config/containerTypes';
import { AuthService } from '../services/auth.service';
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  authenticateJWT,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '../middlewares/auth.middleware';
import { UserService } from '../../users/services/user.service';
import { ClientService } from '../../../external/knowledgeBase/services/client.service';
const GOOGLE_AUTH_OPTIONS = {
  scope: ['profile', 'email'],
};

const authController = container.get<AuthController>(AuthController);
const authService = container.get<AuthService>(TYPES.AuthService);
const userService = container.get<UserService>(TYPES.IUserService);
const clientService = container.get<ClientService>(TYPES.IClientService);

const authRouter = Router();

// const converter = (payload: JwtPayload | User): User | null => {
//   if (payload instanceof User) {
//     return payload as User;
//   }
//   return null;
// };

authRouter.get('/google', passport.authenticate('google', GOOGLE_AUTH_OPTIONS));

authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${appConfig.frontendUrl}/login?error=true`,
    failWithError: true,
    session: false,
  }),
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      return res.redirect(`${appConfig.frontendUrl}/login?error=true`);
    }
    const userPayload = req.user;

    // const user = converter(payload);

    // if (!user) {
    //   throw new BusinessLogicError('Could not convert payload to User');
    // }

    try {

      const accessToken = authService.generateAccessToken(userPayload);

      const refreshToken = authService.generateRefreshToken(userPayload);

      const accessTokenMaxAge = 20 * 60 * 1000; // 20 minutes
      const refreshTokenMaxAge = 1 * 24 * 60 * 60 * 1000; // 1 day

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        maxAge: accessTokenMaxAge,
        sameSite: 'lax',
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        maxAge: refreshTokenMaxAge,
        sameSite: 'lax',
      });

      res.redirect(`${appConfig.frontendUrl}/home`);
    } catch (error) {
      logger.error(
        'Field to generate tokens or set cookies after Google auth: ',
        error,
      );
      res.redirect(`${appConfig.frontendUrl}/login?error=true`);
    }
  },
);

authRouter.get('/me', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const [permissions, fullUser, clients] = await Promise.all([
      userService.getUserPermissions(user.id),
      userService.getUserById(user.id),
      clientService.getClientsByAccess(user.id),
    ]);

    const worksInIM = clients.some((client) => client.is_im);
    const worksInFLX = clients.some((client) => client.is_flx);

    res.json({
      user: {
        id: fullUser.user_id,
        username: `${fullUser.first_name} ${fullUser.last_name}`,
        worksInIM,
        worksInFLX,
      },
      permissions,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authController.refresh(req, res);
    } catch (error) {
      next(error);
    }
  },
);

authRouter.post('/logout', async (_req: Request, res: Response) => {
  res.clearCookie('accessToken', {
    ...ACCESS_TOKEN_COOKIE_OPTIONS,
    maxAge: 0,
  });
  res.clearCookie('refreshToken', {
    ...REFRESH_TOKEN_COOKIE_OPTIONS,
    maxAge: 0,
  });

  res.sendStatus(204);
});

export { authRouter };
