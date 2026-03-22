import { CONTEXT_CONFIG, TAG, Logger, utils } from '@dersim/api-core';
import { MessageRole, IMessage } from '@dersim/shared';
import SessionService from '../service/session.service';
import messageBuilder from '../helper/messageBuilder';
import AiService from '../service/ai.service';
import { ISession } from '../schema/session';

class SessionGenerator {
    protected parseJsonMessage(jsonString: string): any {
        if (!jsonString) {
            Logger.error(TAG.GEN_SESSION, 'JSON string is empty');
            return null;
        }
        try {
            return utils.parseAiResponseToJson(jsonString);
        } catch (error) {
            Logger.error(TAG.GEN_SESSION, 'Failed to parse JSON completion:', jsonString);
            Logger.error(TAG.GEN_SESSION, 'Failed to parse JSON completion:', error);
            return null;
        }
    }

    async generateCondensedMessages(session: ISession): Promise<ISession> {
        const immediateMessages = session.context.immediate;
        if (!immediateMessages?.length) return session;

        const [newMessages, oldMessages] = this.getSplitMessages(
            immediateMessages,
            CONTEXT_CONFIG.IMMEDIATE.CONTEXT_WINDOW,
            CONTEXT_CONFIG.CONDENSATION.TRIM_RATIO
        );

        const prompt = messageBuilder.buildCondensationPrompt(oldMessages);
        const response = await AiService.generateContent(prompt, session.id);
        const jsonObject = this.parseJsonMessage(response);
        if (!jsonObject || !jsonObject.messages) return session;

        const condensedMessages: IMessage[] = [];
        for (const jsonMessage of jsonObject.messages) {
            const { role, text } = jsonMessage;
            if (role && text) condensedMessages.push({ role, content: text });
        }

        if (!condensedMessages.length) {
            Logger.error(TAG.GEN_SESSION, 'Error empty condensed message for session:', session._id);
            return session;
        }

        try {
            await SessionService.setImmediateMessages(session.id, newMessages);
            return await SessionService.pushCondensedMessages(session.id, condensedMessages);
        } catch (error) {
            Logger.error(TAG.GEN_SESSION, 'Failed to set immediate messages:', error);
            return session;
        }
    }

    async generateSummary(session: ISession): Promise<ISession> {
        const messages = session.context.immediate;
        const prompt = messageBuilder.buildSummarizationPrompt(messages);
        const summary = await AiService.generateContent(prompt, session.id);
        try {
            return await SessionService.setSummary(session.id, summary);
        } catch (error) {
            Logger.error(TAG.GEN_SESSION, 'Failed to update session:', error);
            return session;
        }
    }

    private getSplitMessages(messages: IMessage[], contextWindowCount: number, trimRatio: number): [IMessage[], IMessage[]] {
        let tokenCount = utils.estimateTokenCount(messages);
        const oldMessages: IMessage[] = [];
        while (tokenCount >= contextWindowCount * trimRatio) {
            const oldMessage = messages.shift();
            tokenCount = utils.estimateTokenCount(messages);
            if (oldMessage) oldMessages.push(oldMessage);
        }
        return [messages, oldMessages];
    }
}

const sessionGenerator = new SessionGenerator();
export default sessionGenerator;
