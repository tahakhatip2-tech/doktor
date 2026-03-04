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
        if (!this.supabase) {
            throw new Error('Supabase client is not initialized');
        }

        const fileExt = extname(file.originalname);
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        const fileName = `${folder}/${randomName}${fileExt}`;

        const { data, error } = await this.supabase
            .storage
            .from(this.bucketName)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            this.logger.error(`Failed to upload file: ${error.message}`);
            throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = this.supabase
            .storage
            .from(this.bucketName)
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    }
}
