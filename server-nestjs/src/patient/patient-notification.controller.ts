import { Controller, Get, Put, Delete, UseGuards, Request, Param, ParseIntPipe } from '@nestjs/common';
import { PatientNotificationService } from './patient-notification.service';
import { PatientAuthGuard } from './patient-auth.guard';

@Controller('patient/notifications')
@UseGuards(PatientAuthGuard)
export class PatientNotificationController {
    constructor(private readonly notificationService: PatientNotificationService) { }

    @Get()
    async getNotifications(@Request() req) {
        return this.notificationService.getNotifications(req.user.id);
    }

    @Get('unread-count')
    async getUnreadCount(@Request() req) {
        return this.notificationService.getUnreadCount(req.user.id);
    }

    @Put(':id/read')
    async markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.notificationService.markAsRead(req.user.id, id);
    }

    @Put('mark-all-read')
    async markAllAsRead(@Request() req) {
        return this.notificationService.markAllAsRead(req.user.id);
    }

    @Delete(':id')
    async deleteNotification(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.notificationService.deleteNotification(req.user.id, id);
    }
}
