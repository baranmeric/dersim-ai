
import SessionService from "../service/session.service";
import { CONTEXT_CONFIG } from "../config/config";
import { TAG, Logger } from "../helper/logger";
import messageBuilder from "../helper/messageBuilder";
import AiService from "../service/ai.service";
import { MessageRole } from '@dersim/shared';
import { IMessage } from '@dersim/shared';
import { utils } from "../helper/utils";
import { ISession } from "../schema/session";


class SessionGenerator {
    protected parseJsonMessage(jsonString: string): any {
        if (!jsonString) {
            Logger.error(TAG.GEN_SESSION, 'JSON string is empty');
            return null;
        }
        try {
            const json = utils.parseAiResponseToJson(jsonString);
            return json;
        } catch (error) {
            Logger.error(TAG.GEN_SESSION, 'Failed to parse JSON completion:', jsonString);
            Logger.error(TAG.GEN_SESSION, 'Failed to parse JSON completion:', error);
            return null;
        }
    }

    // Condensation
    async generateCondensedMessages(session: ISession): Promise<ISession> {
        const immediateMessages = session.context.immediate;
        if (!immediateMessages?.length) {
            return session;
        }
        const [newMessages, oldMessages] = this.getSplitMessages(immediateMessages, CONTEXT_CONFIG.IMMEDIATE.CONTEXT_WINDOW, CONTEXT_CONFIG.CONDENSATION.TRIM_RATIO);

        // Generate condensed message
        const prompt = messageBuilder.buildCondensationPrompt(oldMessages);
        const response = await AiService.generateContent(prompt, session.id);

        const jsonObject = this.parseJsonMessage(response);
        if (!jsonObject || !jsonObject.messages) return session;

        let condensedMessages: IMessage[] = [];
        for (const jsonMessage of jsonObject.messages) {
            const { role, text } = jsonMessage;
            if (role && text) {
                condensedMessages.push({
                    role: role,
                    content: text,
                });
            }
        }

        if (!condensedMessages.length) {
            Logger.error(TAG.GEN_SESSION, 'Error empty condensed message for session:', session._id);
            return session;
        }

        try {
            await SessionService.setImmediateMessages(session.id, newMessages); // only keep newer messages, which have not been condensed
            return await SessionService.pushCondensedMessages(session.id, condensedMessages); // add condensed message
        } catch (error) {
            Logger.error(TAG.GEN_SESSION, 'Failed to set immediate messages:', error);
            return session;
        }
    }

    // Summarization
    async generateSummary(session: ISession): Promise<ISession> {
        const messages = session.context.immediate;

        // Generate summary message
        const prompt = messageBuilder.buildSummarizationPrompt(messages);
        const summary = await AiService.generateContent(prompt, session.id);

        // Set session summary
        const id = session.id;
        try {
            return await SessionService.setSummary(id, summary);
        } catch (error) {
            Logger.error(TAG.GEN_SESSION, 'Failed to update session:', error);
            return session;
        }
    }

    private getSplitMessages(messages: IMessage[], contextWindowCount: number, trimRatio: number): [IMessage[], IMessage[]] {
        let tokenCount = utils.estimateTokenCount(messages);
        // Remove old messages until only ratio of newer messages remain
        const oldMessages: IMessage[] = [];
        while (tokenCount >= contextWindowCount * trimRatio) {
            const oldMessage = messages.shift();
            tokenCount = utils.estimateTokenCount(messages);
            if (oldMessage) {
                oldMessages.push(oldMessage);
            }
        }
        return [messages, oldMessages];
    }
}

const sessionGenerator = new SessionGenerator();
export default sessionGenerator;
