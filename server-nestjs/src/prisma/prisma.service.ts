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

    // Helper method to handle transient errors with auto-reconnect
    async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
        let lastError: any;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;

                // Retry on connection errors (P1001 = can't connect, P1017 = connection closed)
                if (error.code === 'P1001' || error.code === 'P1017') {
                    this.logger.warn(`Database connection lost (attempt ${i + 1}/${maxRetries}), reconnecting...`);
                    const delay = 1000 * (i + 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    // Force reconnect before next attempt
                    try {
                        await this.$disconnect();
                        await this.$connect();
                        this.logger.log('Reconnected to database successfully');
                    } catch (reconnectErr: any) {
                        this.logger.error(`Reconnect failed: ${reconnectErr.message}`);
                    }
                } else {
                    throw error;
                }
            }
        }

        throw lastError;
    }
}
