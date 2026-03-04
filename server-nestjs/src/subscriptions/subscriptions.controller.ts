import { Controller, Get, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Get('plans')
    getPlans() {
        return this.subscriptionsService.getPlans();
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    getMySubscription(@Request() req) {
        return this.subscriptionsService.getUserSubscription(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('checkout')
    checkout(@Request() req, @Body('planId') planId: number) {
        return this.subscriptionsService.createCheckoutSession(req.user.id, planId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('checkout-manual')
    @UseInterceptors(FileInterceptor('receipt', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
            }
        })
    }))
    checkoutManual(@Request() req, @Body('planId') planName: string, @UploadedFile() receipt: Express.Multer.File) {
        return this.subscriptionsService.createManualSubscription(req.user.id, planName, receipt?.filename);
    }
}
