import { MessageRole } from "../enum/messageRole";

export interface IMessage {
    role: MessageRole;
    content: string;
}

export interface IDisplayMessage extends IMessage {
    createdAt?: Date;
    updatedAt?: Date;
}
