import { NotificationType, SessionNotification, ISessionListItem } from '@dersim/shared';

export const NotificationFactory = {
    createSessionNotification: (session: ISessionListItem): SessionNotification => {
        return {
            type: NotificationType.SESSION_UPDATE,
            session
        };
    }
};
