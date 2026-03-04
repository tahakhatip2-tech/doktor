import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Appointments (e2e)', () => {
    let app: INestApplication;
    let authToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();

        // Login to get token for authenticated requests
        const response = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: 'tahakhatip2@gmail.com',
                password: 'yourpassword',
            });
        authToken = response.body.access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/appointments (GET)', () => {
        it('should get all appointments', () => {
            return request(app.getHttpServer())
                .get('/api/appointments')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('should fail without token', () => {
            return request(app.getHttpServer())
                .get('/api/appointments')
                .expect(401);
        });
    });

    describe('/api/appointments/today (GET)', () => {
        it('should get today\'s appointments', () => {
            return request(app.getHttpServer())
                .get('/api/appointments/today')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
        });
    });

    describe('/api/appointments (POST)', () => {
        it('should create a new appointment', async () => {
            const today = new Date();
            today.setDate(today.getDate() + 1); // Tomorrow
            today.setHours(10, 0, 0, 0);

            const appointmentData = {
                phone: '+962799988776',
                customerName: 'E2E Test Patient',
                appointmentDate: today.toISOString(),
                status: 'pending',
                type: 'consultation',
            };

            return request(app.getHttpServer())
                .post('/api/appointments')
                .set('Authorization', `Bearer ${authToken}`)
                .send(appointmentData)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.customerName).toBe(appointmentData.customerName);
                });
        });
    });

    describe('/api/appointments/stats (GET)', () => {
        it('should get appointment statistics', () => {
            return request(app.getHttpServer())
                .get('/api/appointments/stats')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('total');
                    expect(res.body).toHaveProperty('confirmed');
                });
        });
    });
});
