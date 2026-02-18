import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SeedService } from './seed.service';
import { CategoryModule } from './category/category.module';

import { LoggingMiddleware } from './middleware/logging.middleware';
import { StorageModule } from './storage/storage.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['../.env', '.env'],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                // entities: [__dirname + '/**/*.entity{.ts,.js}'],
                autoLoadEntities: true,
                synchronize: true, // Auto-create tables (dev only)
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        ProductsModule,
        CategoryModule,
        StorageModule,
    ],
    controllers: [AppController],
    providers: [AppService, SeedService],
})
export class AppModule implements NestModule {
    constructor(private configService: ConfigService) { }

    configure(consumer: MiddlewareConsumer) {
        if (this.configService.get('DEBUG') === 'true') {
            console.log('------------------------------------------------');
            console.log('DEBUG MODE ENABLED: LoggingMiddleware registered in AppModule');
            console.log('------------------------------------------------');
            consumer.apply(LoggingMiddleware).forRoutes('*');
        }
    }
}
