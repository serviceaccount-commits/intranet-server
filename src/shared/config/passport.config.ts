import { logger } from '../utils/logger';
import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import appConfig from './appConfig';
import { container } from './inversify.config';
import { TYPES } from './containerTypes';
import { IUserRepository } from '../../modules/internal/users/interfaces/users/user.repository.interface';
import { PassportEror } from '../errors/PassportError';
import { JwtUserPayload } from '../../modules/internal/auth/types/jwtUserPayload.interface';

const userRepository: IUserRepository = container.get(TYPES.IUserRepository);

export const configurePassport = async () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: appConfig.googleOAuth.clientId,
        clientSecret: appConfig.googleOAuth.clientSecret,
        callbackURL: appConfig.googleOAuth.callbackURL,
        scope: ['profile', 'email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
      ) => {
        try {
          if (!profile || !profile.emails || profile.emails.length === 0) {
            throw new PassportEror('Could not process user profile.');
          }

          const email = profile.emails[0]?.value;

          if (!email) {
            throw new PassportEror('Could not process user profile.');
          }


          const user = await userRepository.findUserByEmail(email);
          if (!user) {
            return done(null, false, {
              message: 'Could not process user profile.',
            });
          }

          const jwtUserPayload: JwtUserPayload = {
            id: user.user_id,
            username: user.first_name,
            permissions: user.role.permissions.map((p) => p.permission_id),
          };

          return done(null, jwtUserPayload);
        } catch (error) {
          logger.error('Google strategy verification error: ', error);
          return done(error);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = userRepository.findUserById(id);

      done(null, user);
    } catch (error) {
      done(error);
    }
  });

};
