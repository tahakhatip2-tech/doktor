import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Contacts (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let createdContactId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();

        // Login to get token
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

    describe('/api/contacts (GET)', () => {
        it('should get all contacts', () => {
            return request(app.getHttpServer())
                .get('/api/contacts')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                });
        });

        it('should fail without token', () => {
            return request(app.getHttpServer())
                .get('/api/contacts')
                .expect(401);
        });
    });

    describe('/api/contacts (POST)', () => {
        it('should create a new contact', () => {
            const contactData = {
                phone: '+962777112233',
                name: 'E2E Contact',
                platform: 'manual',
            };

            return request(app.getHttpServer())
                .post('/api/contacts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(contactData)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.name).toBe(contactData.name);
                    createdContactId = res.body.id;
                });
        });
    });

    describe('/api/contacts (GET search)', () => {
        it('should search contacts by name', () => {
            return request(app.getHttpServer())
                .get('/api/contacts?search=E2E')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBeGreaterThan(0);
                });
        });
    });

    describe('/api/contacts/:id (PUT)', () => {
        it('should update contact status', () => {
            return request(app.getHttpServer())
                .put(`/api/contacts/${createdContactId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'archived' }) // Assuming update endpoint accepts Partial<Contact>
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBe('archived');
                });
        });
    });

    describe('/api/contacts/:id (DELETE)', () => {
        it('should delete the contact', () => {
            return request(app.getHttpServer())
                .delete(`/api/contacts/${createdContactId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
        });
    });
});
