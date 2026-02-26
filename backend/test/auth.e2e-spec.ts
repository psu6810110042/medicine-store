import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';

describe('AppController (e2e) - Complete Security Matrix', () => {
    let app: INestApplication;

    beforeAll(async () => {
        // Suppress console logging during tests
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.use(cookieParser());
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        app.use(
            session({
                secret: 'test-secret',
                resave: false,
                saveUninitialized: false,
            }),
        );
        app.use(passport.initialize());
        app.use(passport.session());

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        fullName: 'Test User',
        phoneNumber: '0812345678',
    };

    let userCookie: string[];
    let adminCookie: string[];

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    describe('1. Auth: Register & Login (All Roles)', () => {
        it('POST /auth/register - Register New Customer (201)', async () => {
            return request(app.getHttpServer())
                .post('/auth/register')
                .send(testUser)
                .expect(201)
                .expect((res) => {
                    expect(res.body.email).toEqual(testUser.email);
                });
        });

        it('POST /auth/login - Login as Customer (201)', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(201);

            userCookie = response.get('Set-Cookie');
            expect(userCookie).toBeDefined();
        });

        it('POST /auth/login - Login as Admin (201)', async () => {
            if (!adminEmail || !adminPassword) {
                console.warn('Skipping Admin Login test');
                return;
            }

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: adminEmail,
                    password: adminPassword,
                })
                .expect(201);

            adminCookie = response.get('Set-Cookie');
            expect(adminCookie).toBeDefined();
        });

        it('POST /auth/login - Login Failure (401)', async () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword',
                })
                .expect(401);
        });
    });

    describe('2. Users Endpoints', () => {
        it('GET /auth/me - Guest Blocked (403)', async () => {
            return request(app.getHttpServer())
                .get('/auth/me')
                .expect(403);
        });

        it('GET /auth/me - Customer Access (200)', async () => {
            return request(app.getHttpServer())
                .get('/auth/me')
                .set('Cookie', userCookie)
                .expect(200)
                .expect((res) => {
                    expect(res.body.role).toEqual('customer');
                });
        });

        it('GET /auth/me - Admin Access (200)', async () => {
            if (!adminCookie) return;
            return request(app.getHttpServer())
                .get('/auth/me')
                .set('Cookie', adminCookie)
                .expect(200)
                .expect((res) => {
                    expect(res.body.role).toEqual('admin');
                });
        });
    });

    describe('3. Cart Endpoints', () => {
        // Need a valid product ID to test adding to cart. 
        // Since we don't have a product seeded in the test DB guaranteed, 
        // we might just test the 400 Bad Request if fields are missing, 
        // or mock the CartService if we wanted true unit isolation, but this is e2e.
        // We can try to assume a dummy UUID and expect 404 from DB or 500 if FK fails 
        // OR we can explicitly test that Guest is blocked.

        const dummyProductId = '00000000-0000-0000-0000-000000000000';

        it('GET /cart - Guest Blocked (403)', async () => {
            return request(app.getHttpServer())
                .get('/cart')
                .expect(403);
        });

        it('POST /cart - Guest Blocked (403)', async () => {
            return request(app.getHttpServer())
                .post('/cart')
                .send({ productId: dummyProductId, quantity: 1 })
                .expect(403);
        });

        it('GET /cart - Customer Access (200)', async () => {
            return request(app.getHttpServer())
                .get('/cart')
                .set('Cookie', userCookie)
                .expect(200);
        });

        // We can't easily test "Add to Cart Success" without a real product in DB 
        // unless we seed one in beforeAll.
        // But we can test Validation Error (400)
        it('POST /cart - Validation Error (400)', async () => {
            return request(app.getHttpServer())
                .post('/cart')
                .set('Cookie', userCookie)
                .send({ quantity: 1 }) // Missing productId
                .expect(400);
        });
    });
});
