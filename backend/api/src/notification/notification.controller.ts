import { Body, Controller, Delete, Get, Post, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationDto } from 'src/dtos/Notification.dto';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('create')
    async create(@Body() notificationDto: NotificationDto) {
        return this.notificationService.createNotification(notificationDto);
    }

    @Get('recipient/:id')
    async getByRecipient(@Param('id') recipientId: number) {
        return this.notificationService.getNotificationsByRecipient(recipientId);
    }

    @Post('mark-as-read/:id')
    async markAsRead(@Param('id') notificationId: number) {
        return this.notificationService.markAsRead(notificationId);
    }

    @Delete('delete/:id')
    async delete(@Param('id') notificationId: number) {
        return this.notificationService.deleteNotification(notificationId);
    }

    @Get('unread-count/:recipientId')
    async countUnread(@Param('recipientId') recipientId: number) {
        return this.notificationService.countUnreadNotifications(recipientId);
    }

    @Delete('delete-by-recipient/:recipientId')
    async deleteByRecipient(@Param('recipientId') recipientId: number) {
        return this.notificationService.deleteNotificationsByRecipient(recipientId);
    }
}
