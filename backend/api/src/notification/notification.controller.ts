import { Body, Controller, Delete, Get, Post, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationDto } from 'src/dtos/Notification.dto';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post('create')
    async create(@Body() notificationDto: NotificationDto) {
        return await this.notificationService.createNotification(notificationDto);
    }

    @Get('recipient/:id')
    async getByRecipient(@Param('id') recipientId: number) {
        return await this.notificationService.getNotificationsByRecipient(recipientId);
    }

    @Post('mark-as-read/:id')
    async markAsRead(@Param('id') notificationId: number) {
        return await this.notificationService.markAsRead(notificationId);
    }

    @Delete('delete/:id')
    async delete(@Param('id') notificationId: number) {
        return await this.notificationService.deleteNotification(notificationId);
    }

    @Get('unread-count/:recipientId')
    async countUnread(@Param('recipientId') recipientId: number) {
        return await this.notificationService.countUnreadNotifications(recipientId);
    }

    @Delete('delete-by-recipient/:recipientId')
    async deleteByRecipient(@Param('recipientId') recipientId: number) {
        return await this.notificationService.deleteNotificationsByRecipient(recipientId);
    }

    @Post("sendNotification")
    async sendNotification(@Body() notification: {bike_rack_id:number, user_id: number, content: {title: string, message: string}}){
        return await this.notificationService.sendNotification(notification.bike_rack_id, notification.user_id, notification.content.title, notification.content.message);
    }

    @Post("sendToAllBikerack")
    async sendNotificationBikerack(@Body() notification: {id_bikerack: number, content: {title: string, message: string}}){
        return await this.notificationService.sendNotificationBikerack(notification.id_bikerack, notification.content.title, notification.content.message);
    }

    @Post("sendToAllAttendant")
    async sendNotificationAttendants(@Body() notification: {id_bikerack: number, content: {title: string, message: string}}){
        return await this.notificationService.sendToAllAttendant(notification.id_bikerack, notification.content.title, notification.content.message);
    }

    @Post("sendToAllSuperiors")
    async sendNotificationSuperiors(@Body() notification: {id_bikerack: number, content: {title: string, message: string}}){
        return await this.notificationService.sendNotificationSuperiors(notification.id_bikerack, notification.content.title, notification.content.message);
    }

    @Post("sendToEveryoneExceptCustomers")
    async sendToEveryoneExceptCustomers(@Body() notification: {id_bikerack: number, content: {title: string, message: string}}){
        return await this.notificationService.sendToEveryoneExceptCustomers(notification.id_bikerack, notification.content.title, notification.content.message);
    }
}
