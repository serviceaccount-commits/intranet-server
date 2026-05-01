import { DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
import { EnvironmentError } from '../errors/EnvironmentError';
import path from 'path';
import fs from 'fs';
import { FileReadingError } from '../errors/FileReadingError';
// ✅ Corrected, case-sensitive path
// import { ALL_ENTITIES } from '../database/allEntities';

import * as jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

dotenv.config();

interface AppConfig {
  port: number;
  internalApiKey: string;
  environment: string;
  frontendUrl: string;
  cookieSecret: string;
  backendUrl: string;
  geminiAIApiKey: string;
  s3BucketName: string;
  awsRegion: string;
  mongodb: {
    uri: string;
    dbName: string;
  };
  jwt: {
    privateKey: string;
    publicKey: string;
    algorithms: jwt.Algorithm[];
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
    issuer: string;
    audience: string;
  };
  verifyEmailJwt: {
    privateKey: string;
    algorithms: jwt.Algorithm[];
    tokenExpiresIn: string;
    issuer: string;
    audience: string;
  };
  googleOAuth: {
    clientId: string;
    clientSecret: string;
    callbackURL: string;
  };
}

const readKeyFile = (filePath: string | undefined): string => {
  if (!filePath) {
    throw new EnvironmentError(
      'JWT key file path is not defined in environment variables.',
    );
  }
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    return fs.readFileSync(absolutePath, 'utf8');
  } catch (error) {
    logger.error(`Error reading key file at ${filePath}: `, error);
    throw new FileReadingError(`Could not read JWT key file: ${filePath}`);
  }
};

const loadConfig = (): AppConfig => {
  const config: AppConfig = {
    port: parseInt(process.env['PORT'] || '3000', 10),
    internalApiKey: process.env['INTERNAL_API_KEY'] || '',
    environment: process.env['NODE_ENV'] || 'development',
    frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:5173',
    cookieSecret:
      process.env['COOKIE_SECRET'] || 'default_cookie_secret_change_me',
    backendUrl: process.env['BACKEND_URL'] || 'http://localhost:3000',
    geminiAIApiKey: process.env['GEMINI_AI_API_KEY'] || '',
    s3BucketName: process.env['S3_BUCKET_NAME'] || '',
    awsRegion: process.env['AWS_REGION'] || '',
    mongodb: {
      uri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017',
      dbName: process.env['MONGODB_DB_NAME'] || 'paricus_kb',
    },
    jwt: {
      privateKey: readKeyFile(process.env['JWT_PRIVATE_KEY_PATH']),
      publicKey: readKeyFile(process.env['JWT_PUBLIC_KEY_PATH']),
      algorithms: [(process.env['JWT_ALGORITHM'] || 'RS256') as jwt.Algorithm],
      accessTokenExpiresIn:
        process.env['JWT_ACCESS_TOKEN_EXPIRATION'] || '1200',
      refreshTokenExpiresIn:
        process.env['JWT_REFRESH_TOKEN_EXPIRATION'] || '86400',
      issuer: process.env['JWT_ISSUER'] || 'Paricus',
      audience: process.env['JWT_AUDIENCE'] || 'IntranetApp',
    },
    verifyEmailJwt: {
      privateKey: readKeyFile(process.env['JWT_VERIFY_EMAIL_PRIVATE_KEY_PATH']),
      algorithms: [(process.env['JWT_ALGORITHM'] || 'RS256') as jwt.Algorithm],
      tokenExpiresIn: process.env['JWT_VERIFY_EMAIL_EXPIRATION'] || '86400',
      issuer: process.env['JWT_ISSUER'] || 'Paricus',
      audience: process.env['JWT_VERIFY_EMAIL_AUDIENCE'] || 'IntranetApp',
    },
    googleOAuth: {
      clientId: process.env['GOOGLE_OAUTH_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_OAUTH_CLIENT_SECRET'] || '',
      callbackURL: process.env['GOOGLE_OAUTH_CALLBACK_URL'] || '',
    },
  };

  if (!config.jwt.privateKey || !config.jwt.publicKey) {
    throw new EnvironmentError('JWT private or public key is missing');
  }

  if (config.cookieSecret === 'default_cookie_secret_change_me') {
    logger.warn(
      'WARNING: Default COOKIE_SECRET in use. Please set a strong secret the .env file.',
    );
  }
  if (
    !config.googleOAuth.clientId ||
    !config.googleOAuth.clientSecret ||
    !config.googleOAuth.callbackURL
  ) {
    throw new EnvironmentError('Google OAuth credentials are missing');
  }

  return config;
};

export const devDatabaseConfig: DataSourceOptions = {
  type: 'postgres', //cast to the type
  host: process.env['DATABASE_HOST'] || 'localhost',
  port: parseInt(process.env['DATABASE_PORT'] || '5432', 10),
  username: process.env['DATABASE_USERNAME'],
  password: process.env['DATABASE_PASSWORD'],
  database: process.env['DATABASE_NAME'],
  entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'], // Important: Path to your entities
  synchronize: false, // NEVER set to true in production!
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'], // Path to migrations
  logging: true, // Log SQL queries in development

  // ... other options ...
};

//! FILL WITH QA ENVIRONMENT CREDENTIALS
export const qaDatabaseConfig: DataSourceOptions = {
  type: 'postgres', //cast to the type
  host: process.env['DATABASE_HOST'] || 'localhost',
  port: parseInt(process.env['DATABASE_PORT'] || '5432', 10),
  username: process.env['DATABASE_USERNAME'],
  password: process.env['DATABASE_PASSWORD'],
  database: process.env['DATABASE_NAME'],
  entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'], // Important: Path to your entities
  synchronize: false, // NEVER set to true in production!
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'], // Path to migrations
  logging: process.env['NODE_ENV'] === 'development', // Log SQL queries in development
  // ... other options ...
};

//! FILL WITH PRODUCTION ENVIRONMENT CREDENTIALS
export const prodDatabaseConfig: DataSourceOptions = {
  type: 'postgres', //cast to the type
  host: process.env['DATABASE_HOST'] || 'localhost',
  port: parseInt(process.env['DATABASE_PORT'] || '5432', 10),
  username: process.env['DATABASE_USERNAME'],
  password: process.env['DATABASE_PASSWORD'],
  database: process.env['DATABASE_NAME'],
  entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'], // Important: Path to your entities
  synchronize: false, // NEVER set to true in production!
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'], // Path to migrations
  logging: process.env['NODE_ENV'] === 'development', // Log SQL queries in development
  // ... other options ...
};

const appConfig = loadConfig();

export default appConfig;
