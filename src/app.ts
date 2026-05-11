import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import appConfig from './shared/config/appConfig';
import apiLayerRouter from './api-layer/api.router';
import { configurePassport } from './shared/config/passport.config';
import passport from 'passport';

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.text({ limit: '25mb' }));
app.use(cookieParser());

const frontendOrigin = appConfig.frontendUrl || 'http://localhost:5173';

const corsOptions = {
  origin: [
    frontendOrigin,
    'https://myparicus.paricus.com',
    'https://www.myparicus.paricus.com',
    'https://portal.paricus.com',
    'https://qa-portal.paricus.com',
    'https://qa-intranet.vercel.app',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:8080',
    'http://localhost:4200',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
  exposedHeaders: ['Content-Disposition', 'Content-Type'],
};

app.use(cors(corsOptions));

configurePassport();
app.use(passport.initialize());

if (appConfig.environment === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiLayerRouter);

export default app;
