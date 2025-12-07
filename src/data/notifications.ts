
import { InAppNotification } from "@/lib/notifications";

// Mock Database for Notifications
export const MOCK_NOTIFICATIONS: InAppNotification[] = [
    {
        id: 'notif-1',
        userId: 'u1',
        type: 'success',
        message: 'Your leave for Christmas has been approved.',
        read: false,
        createdAt: new Date().toISOString()
    }
];

export const addNotification = (notif: InAppNotification) => {
    MOCK_NOTIFICATIONS.unshift(notif);
};

export const markAsRead = (id: string) => {
    const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (notif) notif.read = true;
};

export const markAllAsRead = (userId: string) => {
    MOCK_NOTIFICATIONS.filter(n => n.userId === userId).forEach(n => n.read = true);
};
