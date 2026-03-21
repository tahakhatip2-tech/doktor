import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient | null = null;
    private readonly logger = new Logger(SupabaseService.name);
    private readonly bucketName = 'uploads';

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        // Only initialise if both values are present and look real (not dummy)
        if (supabaseUrl && supabaseKey && !supabaseKey.includes('dummy')) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
        } else {
            this.logger.warn('Supabase not configured — file uploads will use local disk storage.');
        }
    }

    // ── Local disk fallback ──────────────────────────────────────
    private saveLocally(file: Express.Multer.File, folder: string): string {
        const fileExt = extname(file.originalname);
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        const fileName = `${randomName}${fileExt}`;
        const uploadDir = path.join(process.cwd(), 'uploads', folder);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);
        return `/api/uploads/${folder}/${fileName}`;
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'clinic'): Promise<string> {
        // ── Supabase path ───────────────────────────────────────
        if (this.supabase) {
            const fileExt = extname(file.originalname);
            const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
            const fileName = `${randomName}${fileExt}`;
            const supabasePath = `${folder}/${fileName}`;

            const { data, error } = await this.supabase
                .storage
                .from(this.bucketName)
                .upload(supabasePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) {
                this.logger.warn(`Supabase upload failed (${error.message}) — falling back to local storage.`);
                // Fall through to local storage ↓
            } else {
                const { data: publicUrlData } = this.supabase
                    .storage
                    .from(this.bucketName)
                    .getPublicUrl(supabasePath);

                return publicUrlData.publicUrl;
            }
        }

        // ── Local disk fallback ─────────────────────────────────
        const localUrl = this.saveLocally(file, folder);
        this.logger.log(`File saved locally: ${localUrl}`);
        return localUrl;
    }
}
