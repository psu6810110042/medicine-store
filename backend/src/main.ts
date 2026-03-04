import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import * as express from 'express';
import Redis from 'ioredis';

const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

const RedisStore = require('connect-redis').default;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ cookies
  app.use(cookieParser());

  // ✅ redis session store
  const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  });

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
      }),
      secret: process.env.SESSION_SECRET || 'supersecret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
        secure: false,
        sameSite: 'lax',
      },
    }),
  );

  // ✅ passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // ✅ CORS ให้ frontend (Next.js) ใช้ได้ + ส่ง cookie ได้
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // ✅ validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // ✅ serve uploads (slip อยู่ /uploads/slips/...)
  app.use('/uploads', express.static('uploads'));

  const port = process.env.BACKEND_PORT || process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();