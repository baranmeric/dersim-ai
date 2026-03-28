import { createServiceProxy } from '@dersim/api/core';
import { EntityNotFoundError, ForbiddenError, IMessage, IDisplayMessage, ISessionDto, ISessionListItem } from '@dersim/shared';
import { ChatCompletion } from 'together-ai/resources/chat/completions';
import Session, { ISession } from '../schema/session';

const SessionService = {
    async createSession(userId: string): Promise<ISessionDto> {
        const session = await Session.create({ userId });
        return session.toDto();
    },

    async deleteSession(sessionId: string): Promise<string> {
        await Session.findByIdAndDelete(sessionId);
        return `session with id ${sessionId} deleted successfully`;
    },

    async safeDeleteSession(userId: string, sessionId: string): Promise<string> {
        await this.getSafeSessionById(userId, sessionId);
        return await this.deleteSession(sessionId);
    },

    async updateSession(sessionId: string, sessionData: Partial<ISession>): Promise<ISession> {
        const updatedSession = await Session.findByIdAndUpdate(sessionId, { $set: sessionData }, { new: true });
        if (!updatedSession) throw new EntityNotFoundError('Session', sessionId);
        return updatedSession;
    },

    async getUserSessions(userId: string): Promise<ISessionListItem[]> {
        const sessions = await Session.find({ userId }).sort({ updatedAt: -1 });
        return sessions.map(session => session.toListItem());
    },

    async getAllSessions(): Promise<ISession[]> {
        return await Session.find().sort({ updatedAt: -1 });
    },

    async getSafeSessionDtoById(userId: string, sessionId: string): Promise<ISessionDto> {
        const session = await this.getSafeSessionById(userId, sessionId);
        return session.toDto();
    },

    async getSafeSessionById(userId: string, sessionId: string): Promise<ISession> {
        const session = await this.getSessionById(sessionId);
        if (userId !== 'admin' && session.userId.toString() !== userId.toString()) {
            throw new ForbiddenError('User can only access own sessions');
        }
        return session;
    },

    async getSessionById(sessionId: string): Promise<ISession> {
        const session = await Session.findById(sessionId);
        if (!session) throw new EntityNotFoundError('Session', sessionId);
        return session;
    },

    async getRecentSessions(userId: string, skip: number, limit: number): Promise<ISession[]> {
        const recentSessions = await Session.find({
            userId,
            createdAt: { $lt: new Date() }
        }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        if (!recentSessions || recentSessions.length === 0) {
            throw new EntityNotFoundError('Recent Sessions', userId);
        }
        return recentSessions;
    },

    async pushDisplayMessage(sessionId: string, message: IMessage): Promise<ISession> {
        const displayMessage: IDisplayMessage = {
            role: message.role,
            content: message.content,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const updatedSession = await Session.findByIdAndUpdate(sessionId, {
            $push: { displayMessages: displayMessage, 'context.immediate': message },
        }, { new: true });
        if (!updatedSession) throw new EntityNotFoundError('Session', sessionId);
        return updatedSession;
    },

    async incrementUsage(sessionId: string, completion: ChatCompletion): Promise<ISession> {
        const input = completion.usage?.prompt_tokens || 0;
        const output = completion.usage?.completion_tokens || 0;
        const updatedSession = await Session.findByIdAndUpdate(sessionId, {
            $inc: { 'usage.input': input, 'usage.output': output },
        }, { new: true });
        if (!updatedSession) throw new EntityNotFoundError('Session', sessionId);
        return updatedSession;
    },

    async pushCondensedMessages(sessionId: string, messages: IMessage[]): Promise<ISession> {
        const updatedSession = await Session.findByIdAndUpdate(sessionId, {
            $push: { 'context.condensed': { $each: messages } },
        }, { new: true });
        if (!updatedSession) throw new EntityNotFoundError('Session', sessionId);
        return updatedSession;
    },

    async setSummary(sessionId: string, summary: string): Promise<ISession> {
        const updatedSession = await Session.findByIdAndUpdate(sessionId, { $set: { summary } }, { new: true });
        if (!updatedSession) throw new EntityNotFoundError('Session', sessionId);
        return updatedSession;
    },

    async setImmediateMessages(sessionId: string, messages: IMessage[]): Promise<ISession> {
        const updatedSession = await Session.findByIdAndUpdate(sessionId, { $set: { 'context.immediate': messages } }, { new: true });
        if (!updatedSession) throw new EntityNotFoundError('Session', sessionId);
        return updatedSession;
    },

    async setCondensedMessages(sessionId: string, messages: IMessage[]): Promise<ISession> {
        const updatedSession = await Session.findByIdAndUpdate(sessionId, { $set: { 'context.condensed': messages } }, { new: true });
        if (!updatedSession) throw new EntityNotFoundError('Session', sessionId);
        return updatedSession;
    },

    async resetContextWindow(sessionId: string): Promise<ISession> {
        const session = await Session.findById(sessionId);
        if (!session) throw new EntityNotFoundError('Session', sessionId);
        const messages: IMessage[] = session.displayMessages.map(message => ({
            role: message.role,
            content: message.content,
        }));
        let updatedSession = await this.setImmediateMessages(sessionId, messages);
        updatedSession = await this.setCondensedMessages(sessionId, []);
        return updatedSession;
    },
};

export default createServiceProxy(SessionService);
