import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ExtractorService {
    private readonly logger = new Logger(ExtractorService.name);

    constructor(private prisma: PrismaService) { }

    async extractFromFacebook(userId: number, url: string, limit: number = 100) {
        this.logger.log(`Starting Facebook extraction for user ${userId} on URL: ${url}`);

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await this.autoScroll(page);
            await new Promise(r => setTimeout(r, 2000));

            const data = await page.evaluate(() => {
                const title = document.title || '';
                const links = Array.from(document.querySelectorAll('a'));
                const contacts: any[] = [];
                const uniqueProfiles = new Set();

                links.forEach(a => {
                    const href = a.href;
                    if (href.includes('facebook.com') &&
                        !href.includes('/groups/') &&
                        !href.includes('/share') &&
                        !href.includes('/messages/')) {

                        const name = a.innerText.trim();
                        if (name.length > 2 && name.length < 50 && !uniqueProfiles.has(href)) {
                            let context = '';
                            let parent = a.parentElement;
                            let depth = 0;
                            while (parent && depth < 4) {
                                if (parent.innerText.length > name.length + 10) {
                                    context = parent.innerText.replace(name, '').trim().substring(0, 200);
                                    break;
                                }
                                parent = parent.parentElement;
                                depth++;
                            }

                            const phoneMatch = context.match(/(?:\+|00)\d{1,3}[\s-]?\d{4,12}|\b07[7895]\d{7}\b/);
                            const emailMatch = context.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);

                            contacts.push({
                                name: name,
                                profileUrl: href,
                                phone: phoneMatch ? phoneMatch[0] : undefined,
                                email: emailMatch ? emailMatch[0] : undefined,
                                source: 'Facebook Extraction'
                            });
                            uniqueProfiles.add(href);
                        }
                    }
                });
                return contacts;
            });

            // Save to database
            let savedCount = 0;
            for (const contact of data) {
                if (contact.phone) {
                    try {
                        await this.prisma.contact.upsert({
                            where: { userId_phone: { userId, phone: contact.phone } },
                            update: { name: contact.name, profileUrl: contact.profileUrl },
                            create: {
                                userId,
                                phone: contact.phone,
                                name: contact.name,
                                profileUrl: contact.profileUrl,
                                platform: 'facebook',
                                source: 'extractor',
                                status: 'new'
                            }
                        });
                        savedCount++;
                    } catch (e) {
                        this.logger.error(`Error saving contact ${contact.phone}: ${e.message}`);
                    }
                }
            }

            return {
                status: 'completed',
                found: data.length,
                saved: savedCount,
                contacts: data.slice(0, 10) // Return first 10
            };

        } catch (error) {
            this.logger.error(`Extraction failed: ${error.message}`);
            throw error;
        } finally {
            await browser.close();
        }
    }

    private async autoScroll(page: any) {
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= scrollHeight || totalHeight > 5000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    async getExtractionTasks(userId: number) {
        return [];
    }
}
