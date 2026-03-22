import { Schema, Document, model } from 'mongoose';
import { DisplayMessageSchema } from "./message";
import { MessageSchema } from "./message";
import { CONTEXT_CONFIG } from "../config/config";
import { IContext, ISessionDto, ISessionListItem } from '@dersim/shared';
import { SessionTaskType } from '@dersim/shared';
import generateMessagesHash from "../helper/messageHash";
import { utils } from "../helper/utils";
import { IDisplayMessage } from '@dersim/shared';

export interface ISession extends Document {
    id: string;
    userId: string;
    summary: string;
    displayMessages: IDisplayMessage[];
    context: IContext;
    createdAt: Date;
    updatedAt: Date;
    usage: {
        input: number;
        output: number;
    };

    getUserId(): string; // Use this instead of direct accesses to userId to ensure string type instead of objectid
    toDto(): ISessionDto;
    toListItem(): ISessionListItem;
    getCurrentHash(): string,
    isReadyFor(taskType: SessionTaskType): boolean;
}

const ContextSchema = new Schema({
    immediate: { type: [MessageSchema], default: [] },
    condensed: { type: [MessageSchema], default: [] },
}, { _id: false });

const SessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true
    },
    summary: { type: String },
    displayMessages: { type: [DisplayMessageSchema], default: [] },
    context: {
        type: ContextSchema,
        default: () => ({
            immediate: [],
            condensed: [],
        }),
    },
    usage: {
        type: {
            _id: false,
            input: { type: Number, default: 0 },
            output: { type: Number, default: 0 },
        },
        default: () => ({ input: 0, output: 0 }),
    },
}, { timestamps: true });

SessionSchema.methods.getUserId = function (): string {
    return this.userId.toString();
}

SessionSchema.methods.toDto = function (): ISessionDto {
    return {
        _id: this._id.toString(),
        userId: this.userId.toString(),
        summary: this.summary,
        displayMessages: this.displayMessages,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    }
}

SessionSchema.methods.toListItem = function (): ISessionListItem {
    return {
        id: this._id.toString(),
        summary: this.summary,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    }
}

SessionSchema.methods.getCurrentHash = function (): string {
    return generateMessagesHash(this.displayMessages);
}

SessionSchema.methods.isReadyFor = function (taskType: SessionTaskType): boolean {
    switch (taskType) {

        // Check for immediate messages token count
        case SessionTaskType.CONDENSATION: {
            return false; // disable for now;
            const immediateMessages = this.context.immediate;
            if (!immediateMessages || !immediateMessages.length) {
                return false;
            }

            const immediateCount = utils.estimateTokenCount(immediateMessages);
            return immediateCount >= CONTEXT_CONFIG.IMMEDIATE.CONTEXT_WINDOW;
        }

        // Always create a summary if there is none, else check for context window
        case SessionTaskType.SUMMARIZATION: {
            const messages = this.context.immediate;
            if (!messages || !messages.length) {
                return false;
            }
            if (!this.summary || this.summary.length === 0) {
                return true;
            }
            const condensedCount = utils.estimateTokenCount(messages);
            return condensedCount >= CONTEXT_CONFIG.SUMMARY.CONTEXT_WINDOW;
        }

        default:
            return false;
    }
};

export default model<ISession>('Session', SessionSchema);
