import { logger } from '../../../../shared/utils/logger';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import appConfig from '../../../../shared/config/appConfig';
import { JwtUserPayload } from '../types/jwtUserPayload.interface';
import { injectable } from 'inversify';
import { User } from '../../users/entities/User.entity';

@injectable()
export class AuthService {
  private readonly jwtConfig = appConfig.jwt;
  private readonly verifyEmailJwtConfig = appConfig.verifyEmailJwt;

  // -- Token Generation --

  public generateAccessToken(payload: JwtUserPayload): string {
    const options: SignOptions = {
      algorithm: this.jwtConfig.algorithms[0],
      expiresIn: parseInt(this.jwtConfig.accessTokenExpiresIn),
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience,
    };

    return jwt.sign(payload, this.jwtConfig.privateKey, options);
  }

  public generateRefreshToken(payload: JwtUserPayload): string {
    const options: SignOptions = {
      algorithm: this.jwtConfig.algorithms[0],
      expiresIn: parseInt(this.jwtConfig.refreshTokenExpiresIn),
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience,
    };

    const tokenPayload = {
      id: payload.id,
      username: payload.username,
      permissions: payload.permissions,
    };

    return jwt.sign(tokenPayload, this.jwtConfig.privateKey, options);
  }

  public verifyToken(token: string): JwtUserPayload | null {
    try {
      const options: VerifyOptions = {
        algorithms: this.jwtConfig.algorithms,
        issuer: this.jwtConfig.issuer,
        audience: this.jwtConfig.audience,
      };

      const decoded = jwt.verify(
        token,
        this.jwtConfig.publicKey,
        options,
      ) as JwtUserPayload;


      return {
        id: decoded.id,
        username: decoded.username,
        permissions: decoded.permissions,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.error('JWT Token Expired: ', error.message);
        return null;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.error('JWT Invalid Token: ', error.message);
        return null;
      }

      return null;
    }
  }

  public generateVerifyEmailToken(payload: User): string {
    const options: SignOptions = {
      algorithm: this.verifyEmailJwtConfig.algorithms[0],
      expiresIn: parseInt(this.verifyEmailJwtConfig.tokenExpiresIn),
      issuer: this.verifyEmailJwtConfig.issuer,
      audience: this.verifyEmailJwtConfig.audience,
    };

    try {
      // 4. Firma y devuelve el token
      const token = jwt.sign(
        {
          id: payload.user_id,
          email: payload.work_email,
        },
        this.verifyEmailJwtConfig.privateKey,
        options,
      );
      return token;
    } catch (error) {
      logger.error('Error signing the verification token:', error);
      throw new Error('Could not sign the verification token.');
    }
  }
}
