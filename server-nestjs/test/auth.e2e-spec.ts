import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');

        // Enable validation pipe if needed
        // app.useGlobalPipes(new ValidationPipe({
        //   whitelist: true,
        //   forbidNonWhitelisted: true,
        //   transform: true,
        // }));

        await app.init();

        prismaService = app.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/auth/login (POST)', () => {
        it('should login successfully with valid credentials', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'tahakhatip2@gmail.com',
                    password: 'yourpassword', // استخدم كلمة المرور الصحيحة للاختبار
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('access_token');
                    expect(res.body).toHaveProperty('user');
                    expect(res.body.user).toHaveProperty('email');
                    expect(res.body.user).toHaveProperty('id');
                    authToken = res.body.access_token;
                });
        });

        it('should fail with invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'wrongpassword',
                })
                .expect(401)
                .expect((res) => {
                    expect(res.body).toHaveProperty('message');
                    expect(res.body.message).toContain('Invalid credentials');
                });
        });

        it('should fail with missing email', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    password: 'somepassword',
                })
                .expect(400);
        });

        it('should fail with missing password', () => {
            return request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                })
                .expect(400);
        });
    });

    describe('/api/auth/profile (GET)', () => {
        beforeAll(async () => {
            // Login to get token
            const response = await request(app.getHttpServer())
                .post('/api/auth/login')
                .send({
                    email: 'tahakhatip2@gmail.com',
                    password: 'yourpassword',
                });
            authToken = response.body.access_token;
        });

        it('should get profile with valid token', () => {
            return request(app.getHttpServer())
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body).toHaveProperty('email');
                    expect(res.body).toHaveProperty('name');
                    expect(res.body).not.toHaveProperty('password');
                });
        });

        it('should fail without token', () => {
            return request(app.getHttpServer())
                .get('/api/auth/profile')
                .expect(401);
        });

        it('should fail with invalid token', () => {
            return request(app.getHttpServer())
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });

    describe('/api/auth/profile (PUT)', () => {
        it('should update profile with valid token', () => {
            return request(app.getHttpServer())
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Updated Test Name',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.name).toBe('Updated Test Name');
                });
        });

        it('should fail without token', () => {
            return request(app.getHttpServer())
                .put('/api/auth/profile')
                .send({
                    name: 'New Name',
                })
                .expect(401);
        });
    });

    describe('/api/auth/profile/avatar (POST)', () => {
        it('should fail without file', () => {
            return request(app.getHttpServer())
                .post('/api/auth/profile/avatar')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        it('should fail without token', () => {
            return request(app.getHttpServer())
                .post('/api/auth/profile/avatar')
                .expect(401);
        });

        // Note: Testing file upload requires creating a test image file
        // This is a placeholder for the actual file upload test
        it.todo('should upload avatar successfully with valid image file');
    });
});
