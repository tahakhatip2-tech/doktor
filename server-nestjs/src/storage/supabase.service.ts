import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extname } from 'path';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(SupabaseService.name);
    private readonly bucketName = 'uploads'; // Ensure this bucket exists in Supabase

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('Supabase URL or Key is missing in environment variables');
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'clinic'): Promise<string> {
        const fileExt = extname(file.originalname);
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        const fileName = `${randomName}${fileExt}`;

        // If Supabase is NOT configured, store the file locally in 'uploads/' directory
        if (!this.supabase) {
            this.logger.warn('Supabase is not initialized. Falling back to local storage.');
            const fs = require('fs');
            const path = require('path');
            
            // Resolve to the project's uploads folder
            // In NestJS, __dirname is usually dist/src/storage, so process.cwd() is safer
            const uploadDir = path.join(process.cwd(), 'uploads', folder);
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);
            
            // Return path starting with /api/uploads to match NestJS ServeStaticModule serveRoot 
            // and the Vite proxy configuration.
            return `/api/uploads/${folder}/${fileName}`;
        }

        // Upload to Supabase if configured
        const supabasePath = `${folder}/${fileName}`;
        const { data, error } = await this.supabase
            .storage
            .from(this.bucketName)
            .upload(supabasePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            this.logger.error(`Failed to upload file to Supabase: ${error.message}`);
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = this.supabase
            .storage
            .from(this.bucketName)
            .getPublicUrl(supabasePath);

        return publicUrlData.publicUrl;
    }
}
