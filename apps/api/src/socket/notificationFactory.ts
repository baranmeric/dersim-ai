import { NotificationType } from '@dersim/shared';
import { SessionNotification } from '@dersim/shared';
import { ISessionListItem } from '@dersim/shared';


export const NotificationFactory = {
    createSessionNotification: (session: ISessionListItem): SessionNotification => {
        return {
            type: NotificationType.SESSION_UPDATE,
            session
        }
    }
}
