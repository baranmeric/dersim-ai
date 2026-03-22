import { IDisplayMessage, IMessage } from "./message.model";

export interface ISessionDto {
    _id: string,
    userId: string,
    summary: string,
    displayMessages: IDisplayMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ISessionListItem {
    id: string,
    summary: string,
    createdAt: Date,
    updatedAt: Date,
}

export interface IContext {
    immediate: IMessage[],
    condensed: IMessage[],
}

