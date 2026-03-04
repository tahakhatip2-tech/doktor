
import { ExtractorService } from './extractor.service';
import * as puppeteer from 'puppeteer';

// Mock puppeteer
jest.mock('puppeteer', () => ({
    launch: jest.fn(),
}));

describe('ExtractorService', () => {
    let service: ExtractorService;
    let mockPrisma: any;
    let mockBrowser: any;
    let mockPage: any;

    beforeEach(() => {
        mockPrisma = {
            contact: {
                upsert: jest.fn(),
            },
        };

        mockPage = {
            setViewport: jest.fn(),
            setUserAgent: jest.fn(),
            goto: jest.fn(),
            evaluate: jest.fn(),
        };

        mockBrowser = {
            newPage: jest.fn().mockResolvedValue(mockPage),
            close: jest.fn(),
        };

        (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

        service = new ExtractorService(mockPrisma as any);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('extractFromFacebook', () => {
        it('should launch browser and page', async () => {
            const userId = 1;
            const url = 'https://facebook.com/somepage';

            // Mock evaluate data return
            mockPage.evaluate.mockImplementation((fn) => {
                // If the evaluate function is calling autoScroll logic (which returns promise void), 
                // or returning the scraped data.
                // Since update logic uses the return, let's return empty array mostly, 
                // or specific data if we want to test saving.
                return Promise.resolve([]);
            });

            await service.extractFromFacebook(userId, url);

            expect(puppeteer.launch).toHaveBeenCalled();
            expect(mockBrowser.newPage).toHaveBeenCalled();
            expect(mockPage.goto).toHaveBeenCalledWith(url, expect.any(Object));
            expect(mockBrowser.close).toHaveBeenCalled();
        });

        it('should save extracted contacts to prisma', async () => {
            const userId = 1;
            const fakeContacts = [
                { name: 'John Doe', profileUrl: 'fb.com/john', phone: '0799999999' }
            ];

            // First evaluate call is usually autoScroll (void), second collects data?
            // Wait, in the source code:
            // await page.goto(...);
            // await this.autoScroll(page); -> calls page.evaluate
            // const data = await page.evaluate(...); -> calls page.evaluate again

            // So evaluate is called twice.
            mockPage.evaluate
                .mockResolvedValueOnce(undefined) // autoScroll
                .mockResolvedValueOnce(fakeContacts); // extract logic

            await service.extractFromFacebook(userId, 'http://test.com');

            expect(mockPrisma.contact.upsert).toHaveBeenCalledTimes(1);
            expect(mockPrisma.contact.upsert).toHaveBeenCalledWith(expect.objectContaining({
                create: expect.objectContaining({
                    phone: '0799999999',
                    userId: 1
                })
            }));
        });

        it('should close browser even if error occurs', async () => {
            mockPage.goto.mockRejectedValue(new Error('Network error'));

            await expect(service.extractFromFacebook(1, 'http://fail.com')).rejects.toThrow('Network error');

            expect(mockBrowser.close).toHaveBeenCalled();
        });
    });
});
