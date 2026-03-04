import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

let app: NestExpressApplication;

export default async function handler(req, res) {
    if (!app) {
        app = await NestFactory.create<NestExpressApplication>(AppModule);

        // Replicate configuration from main.ts
        app.setGlobalPrefix('api');

        app.enableCors({
            origin: [
                'https://hakeem-jordan-jordan.vercel.app',
                'https://hakeemjordanjo.vercel.app',
                'https://hakeem-jordan-five.vercel.app',
                'http://localhost:8080',
                'http://localhost:5173',
                'http://localhost:3000',
                'https://tsunamic-unshameable-maricruz.ngrok-free.dev',
                'https://hakeem-jordan-jordan.vercel.app/'
            ],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Accept, Authorization, Bypass-Tunnel-Reminder, ngrok-skip-browser-warning',
            credentials: true,
        });

        await app.init();
    }

    const instance = app.getHttpAdapter().getInstance();
    instance(req, res);
}
