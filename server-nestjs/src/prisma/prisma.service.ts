import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;

    constructor() {
        super({
            log: ['error', 'warn'],
            errorFormat: 'minimal',
        });
    }

    async onModuleInit() {
        await this.connectWithRetry();

        // Handle connection errors gracefully
        this.$on('error' as never, (e: any) => {
            this.logger.error(`Prisma Error: ${e.message}`);
        });
    }

    private async connectWithRetry() {
        try {
            await this.$connect();
            this.logger.log('Successfully connected to database');
            this.reconnectAttempts = 0;
        } catch (error) {
            this.reconnectAttempts++;
            this.logger.error(`Failed to connect to database (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}): ${error.message}`);

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.logger.log(`Retrying connection in 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return this.connectWithRetry();
            } else {
                this.logger.error('Max reconnection attempts reached. Please check your database connection.');
                throw error;
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Disconnected from database');
    }

    // Helper method to handle transient errors
    async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
        let lastError: any;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;

                // Only retry on connection errors
                if (error.code === 'P1001' || error.code === 'P1017') {
                    this.logger.warn(`Database operation failed (attempt ${i + 1}/${maxRetries}), retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                } else {
                    throw error;
                }
            }
        }

        throw lastError;
    }
}
