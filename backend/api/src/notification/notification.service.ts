import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { NotificationDto } from 'src/dtos/Notification.dto';

@Injectable()
export class NotificationService {
    constructor(private readonly database: DatabaseService) {}

    async createNotification(notificationDto: NotificationDto) {
        return await this.database.query(
            'INSERT INTO Notification (title, message, read, recipient_id, sender_id) VALUES (?, ?, ?, ?, ?)',
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
            'SELECT * FROM notification WHERE recipient_id = ? ORDER BY created_at DESC',
            [recipientId]
        );
    }

    async markAsRead(notificationId: number) {
        return await this.database.query(
            'UPDATE notification SET read = true WHERE id = ?',
            [notificationId]
        );
    }

    async deleteNotification(notificationId: number) {
        return await this.database.query(
            'DELETE FROM notification WHERE id = ?',
            [notificationId]
        );
    }

    async countUnreadNotifications(recipientId: number) {
        const result = await this.database.query(
            'SELECT COUNT(*) as unreadCount FROM notification WHERE recipient_id = ? AND read = false',
            [recipientId]
        );
        return result[0]?.unreadCount || 0;
    }

    async deleteNotificationsByRecipient(recipientId: number) {
        return await this.database.query(
            'DELETE FROM notification WHERE recipient_id = ?',
            [recipientId]
        );
    }

    async sendNotification(
        bike_rack_id: number,
        user_id: number,
        title: string,
        text: string
    ) {
        return await this.database.query(
        `
            INSERT INTO Notification (sender_id, recipient_id, title, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
        [bike_rack_id, user_id, title, text]
        );
    }

    async sendNotificationBikerack(
        bike_rack_id: number,
        title: string,
        text: string
    ) {
        return await this.database.query(
        `
            INSERT INTO Notification (sender_id, recipient_id, title, message)
            SELECT $1, ur.user_id, $2, $3
            FROM UsersRole ur
            WHERE ur.bike_rack_id = $1
        `,
        [bike_rack_id, title, text]
        );
    }

    async sendToAllAttendant(
        bike_rack_id: number,
        title: string,
        text: string
    ) {
        return await this.database.query(
        `
            INSERT INTO Notification (sender_id, recipient_id, title, message)
            SELECT $1, ur.user_id, $2, $3
            FROM UsersRole ur
            WHERE ur.bike_rack_id = $1
            AND ur.role = 'attendant'
        `,
        [bike_rack_id, title, text]
        );
    }

    async sendNotificationSuperiors(
        bike_rack_id: number,
        title: string,
        text: string
    ) {
        return await this.database.query(
        `
            INSERT INTO Notification (sender_id, recipient_id, title, message)
            SELECT $1, ur.user_id, $2, $3
            FROM UsersRole ur
            WHERE ur.bike_rack_id = $1
            AND ur.role IN ('owner', 'manager')
        `,
        [bike_rack_id, title, text]
        );
    }

    async sendToEveryoneExceptCustomers(
        bike_rack_id: number,
        title: string,
        text: string
    ) {
        return await this.database.query(
        `
            INSERT INTO Notification (sender_id, recipient_id, title, message)
            SELECT $1, ur.user_id, $2, $3
            FROM UsersRole ur
            WHERE ur.bike_rack_id = $1
            AND ur.role != 'customer'
        `,
        [bike_rack_id, title, text]
        );
    }
}
