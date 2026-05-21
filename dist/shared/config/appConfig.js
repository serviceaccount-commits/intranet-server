"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prodDatabaseConfig = exports.qaDatabaseConfig = exports.devDatabaseConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const EnvironmentError_1 = require("../errors/EnvironmentError");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const FileReadingError_1 = require("../errors/FileReadingError");
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const readKeyFile = (filePath) => {
    if (!filePath) {
        throw new EnvironmentError_1.EnvironmentError('JWT key file path is not defined in environment variables.');
    }
    try {
        const absolutePath = path_1.default.resolve(process.cwd(), filePath);
        return fs_1.default.readFileSync(absolutePath, 'utf8');
    }
    catch (error) {
        logger_1.logger.error(`Error reading key file at ${filePath}: `, error);
        throw new FileReadingError_1.FileReadingError(`Could not read JWT key file: ${filePath}`);
    }
};
const loadConfig = () => {
    const config = {
        port: parseInt(process.env['PORT'] || '3000', 10),
        internalApiKey: process.env['INTERNAL_API_KEY'] || '',
        internalAdminApiKey: process.env['INTERNAL_ADMIN_API_KEY'] || '',
        environment: process.env['NODE_ENV'] || 'development',
        frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:5173',
        cookieSecret: process.env['COOKIE_SECRET'] || 'default_cookie_secret_change_me',
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
            algorithms: [(process.env['JWT_ALGORITHM'] || 'RS256')],
            accessTokenExpiresIn: process.env['JWT_ACCESS_TOKEN_EXPIRATION'] || '1200',
            refreshTokenExpiresIn: process.env['JWT_REFRESH_TOKEN_EXPIRATION'] || '86400',
            issuer: process.env['JWT_ISSUER'] || 'Paricus',
            audience: process.env['JWT_AUDIENCE'] || 'IntranetApp',
        },
        verifyEmailJwt: {
            privateKey: readKeyFile(process.env['JWT_VERIFY_EMAIL_PRIVATE_KEY_PATH']),
            algorithms: [(process.env['JWT_ALGORITHM'] || 'RS256')],
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
        throw new EnvironmentError_1.EnvironmentError('JWT private or public key is missing');
    }
    if (config.cookieSecret === 'default_cookie_secret_change_me') {
        logger_1.logger.warn('WARNING: Default COOKIE_SECRET in use. Please set a strong secret the .env file.');
    }
    if (!config.googleOAuth.clientId ||
        !config.googleOAuth.clientSecret ||
        !config.googleOAuth.callbackURL) {
        throw new EnvironmentError_1.EnvironmentError('Google OAuth credentials are missing');
    }
    return config;
};
exports.devDatabaseConfig = {
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
exports.qaDatabaseConfig = {
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
exports.prodDatabaseConfig = {
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
exports.default = appConfig;
//# sourceMappingURL=appConfig.js.map