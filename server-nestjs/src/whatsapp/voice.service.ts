import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';

// Set ffmpeg path from installer
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class VoiceService {
    private readonly logger = new Logger(VoiceService.name);
    private readonly uploadsDir = path.join(process.cwd(), 'uploads');

    constructor() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
        this.logger.log(`[Voice] ffmpeg path: ${ffmpegInstaller.path}`);
    }

    /**
     * Convert OGG/any audio file to MP3 using ffmpeg
     */
    async convertToMp3(inputPath: string): Promise<string> {
        const outputPath = inputPath.replace(/\.\w+$/, '.mp3');
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('mp3')
                .on('end', () => {
                    this.logger.log(`[Voice] Converted to MP3: ${outputPath}`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    this.logger.error(`[Voice] MP3 conversion error: ${err.message}`);
                    reject(err);
                })
                .save(outputPath);
        });
    }

    /**
     * Convert MP3/WAV/PCM to OGG/Opus (required by WhatsApp PTT)
     */
    async convertToOgg(inputPath: string): Promise<string> {
        const outputPath = inputPath.replace(/\.\w+$/, '.ogg');
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('ogg')
                .audioCodec('libopus')
                .audioFrequency(48000)
                .audioChannels(1)
                .on('end', () => {
                    this.logger.log(`[Voice] Converted to OGG/Opus: ${outputPath}`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    this.logger.error(`[Voice] OGG conversion error: ${err.message}`);
                    // Fallback: try without libopus codec
                    this.convertToOggFallback(inputPath).then(resolve).catch(reject);
                })
                .save(outputPath);
        });
    }

    /**
     * Fallback OGG conversion without explicit codec (uses default)
     */
    private async convertToOggFallback(inputPath: string): Promise<string> {
        const outputPath = inputPath.replace(/\.\w+$/, '_fb.ogg');
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('ogg')
                .on('end', () => {
                    this.logger.log(`[Voice] OGG fallback conversion done: ${outputPath}`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    this.logger.error(`[Voice] OGG fallback error: ${err.message}`);
                    reject(err);
                })
                .save(outputPath);
        });
    }

    /**
     * Transcribe OGG audio to text using Gemini API
     */
    async transcribeAudio(audioFilePath: string, apiKey: string): Promise<string | null> {
        try {
            if (!fs.existsSync(audioFilePath)) {
                this.logger.error(`[Voice] Audio file not found: ${audioFilePath}`);
                return null;
            }

            const audioData = fs.readFileSync(audioFilePath);
            const base64Audio = audioData.toString('base64');
            const ext = path.extname(audioFilePath).toLowerCase();
            const mimeType = ext === '.mp3' ? 'audio/mpeg' : 'audio/ogg';

            const isNewKeyFormat = apiKey.startsWith('AQ.');
            const geminiUrl = isNewKeyFormat
                ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
                : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (isNewKeyFormat) headers['X-goog-api-key'] = apiKey;

            const body = {
                contents: [{
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType,
                                data: base64Audio,
                            }
                        },
                        { text: 'Transcribe this audio to text exactly as spoken. Output only the transcription, no explanations.' }
                    ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
            };

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            const data: any = await response.json();
            const transcription = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (transcription) {
                this.logger.log(`[Voice] Transcribed: "${transcription.substring(0, 60)}..."`);
                return transcription.trim();
            }

            this.logger.warn(`[Voice] Transcription failed: ${JSON.stringify(data.error || 'no candidates')}`);
            return null;
        } catch (err) {
            this.logger.error(`[Voice] Transcription error: ${err.message}`);
            return null;
        }
    }

    /**
     * Generate speech from text using Gemini TTS API (gemini-2.5-flash-preview-tts)
     * Returns path to generated MP3 file, or null on failure
     */
    async generateSpeech(text: string, apiKey: string, voiceName: string = 'Aoede'): Promise<string | null> {
        try {
            if (!text || !text.trim()) return null;

            const isNewKeyFormat = apiKey.startsWith('AQ.');
            const geminiUrl = isNewKeyFormat
                ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent`
                : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (isNewKeyFormat) headers['X-goog-api-key'] = apiKey;

            // Clean text: remove action codes like [[APPOINTMENT:...]]
            const cleanText = text.replace(/\[\[.*?\]\]/gs, '').trim();

            const body = {
                contents: [{
                    parts: [{ text: cleanText }]
                }],
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName
                            }
                        }
                    }
                }
            };

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            const data: any = await response.json();

            if (data.error) {
                this.logger.warn(`[Voice] Gemini TTS error: ${data.error.message} — falling back to google-tts`);
                return this.generateSpeechFallback(text);
            }

            // Gemini TTS returns audio as base64 inline data
            const audioPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('audio'));

            if (audioPart?.inlineData?.data) {
                const audioBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
                const filename = `tts_${crypto.randomBytes(4).toString('hex')}.wav`;
                const filePath = path.join(this.uploadsDir, filename);
                fs.writeFileSync(filePath, audioBuffer);
                this.logger.log(`[Voice] Gemini TTS generated: ${filename}`);
                return filePath;
            }

            this.logger.warn(`[Voice] Gemini TTS: no audio in response, falling back`);
            return this.generateSpeechFallback(text);

        } catch (err) {
            this.logger.error(`[Voice] Gemini TTS error: ${err.message}`);
            return this.generateSpeechFallback(text);
        }
    }

    /**
     * Fallback TTS using google-tts-api
     */
    private async generateSpeechFallback(text: string): Promise<string | null> {
        try {
            // Dynamic import since it's a CommonJS module
            const googleTTS = require('google-tts-api');
            const cleanText = text.replace(/\[\[.*?\]\]/gs, '').trim();
            const results = await googleTTS.getAllAudioBase64(cleanText, {
                lang: 'ar',
                slow: false,
                host: 'https://translate.google.com'
            });
            const finalBuffer = Buffer.concat(results.map((r: any) => Buffer.from(r.base64, 'base64')));
            const filename = `tts_fb_${crypto.randomBytes(4).toString('hex')}.mp3`;
            const filePath = path.join(this.uploadsDir, filename);
            fs.writeFileSync(filePath, finalBuffer);
            this.logger.log(`[Voice] Fallback TTS (google-tts) generated: ${filename}`);
            return filePath;
        } catch (e) {
            this.logger.error(`[Voice] Fallback TTS error: ${e.message}`);
            return null;
        }
    }

    /**
     * Full pipeline: text → speech (WAV/MP3) → OGG/Opus (for WhatsApp PTT)
     * Returns OGG file path for sending via WhatsApp, or null on failure
     */
    async textToWhatsAppAudio(text: string, apiKey: string, voiceName: string = 'Aoede'): Promise<string | null> {
        let audioPath: string | null = null;
        let oggPath: string | null = null;

        try {
            // Step 1: Generate speech
            audioPath = await this.generateSpeech(text, apiKey, voiceName);
            if (!audioPath) {
                this.logger.warn('[Voice] Could not generate speech');
                return null;
            }

            // Step 2: Convert to OGG/Opus for WhatsApp
            oggPath = await this.convertToOgg(audioPath);
            return oggPath;

        } catch (err) {
            this.logger.error(`[Voice] textToWhatsAppAudio error: ${err.message}`);
            return null;
        } finally {
            // Cleanup intermediate audio file (keep only OGG)
            if (audioPath && audioPath !== oggPath && fs.existsSync(audioPath)) {
                try { fs.unlinkSync(audioPath); } catch (_) {}
            }
        }
    }

    /**
     * Cleanup a temp file safely
     */
    cleanup(filePath: string) {
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (_) {}
    }
}
