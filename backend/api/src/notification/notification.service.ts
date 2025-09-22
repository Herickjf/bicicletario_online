import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { NotificationDto } from 'src/dtos/Notification.dto';

@Injectable()
export class NotificationService {
    constructor(private readonly database: DatabaseService) {}

    async createNotification(notificationDto: NotificationDto) {
        return await this.database.query(
            'INSERT INTO notifications (title, message, read, recipient_id, sender_id) VALUES (?, ?, ?, ?, ?)',
            [
                notificationDto.title,
                notificationDto.message,
                notificationDto.read || false,
                notificationDto.recipient_id,
                notificationDto.sender_id || null,
            ]
        );
    }

    async getNotificationsByRecipient(recipientId: number) {
        return await this.database.query(
            'SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC',
            [recipientId]
        );
    }

    async markAsRead(notificationId: number) {
        return await this.database.query(
            'UPDATE notifications SET read = true WHERE id = ?',
            [notificationId]
        );
    }

    async deleteNotification(notificationId: number) {
        return await this.database.query(
            'DELETE FROM notifications WHERE id = ?',
            [notificationId]
        );
    }

    async countUnreadNotifications(recipientId: number) {
        const result = await this.database.query(
            'SELECT COUNT(*) as unreadCount FROM notifications WHERE recipient_id = ? AND read = false',
            [recipientId]
        );
        return result[0]?.unreadCount || 0;
    }

    async deleteNotificationsByRecipient(recipientId: number) {
        return await this.database.query(
            'DELETE FROM notifications WHERE recipient_id = ?',
            [recipientId]
        );
    }
}
