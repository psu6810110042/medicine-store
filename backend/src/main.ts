import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

const RedisStore = require('connect-redis').default;
import Redis from 'ioredis';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    const redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    app.use(
        session({
            store: new (RedisStore as any)({
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

    app.use(passport.initialize());
    app.use(passport.session());

    app.enableCors({
        origin: true,
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    const port = process.env.BACKEND_PORT || process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
