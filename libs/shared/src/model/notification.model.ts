import { NotificationType } from "../enum/notificationType";
import { ISessionListItem } from "./session.model";

export interface Notification {
    type: NotificationType;
}

export interface SessionNotification extends Notification {
    session: ISessionListItem;
}
