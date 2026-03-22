import { MessageRole, IMessage } from '@dersim/shared';
import { ISession } from '../schema/session';

const MessageBuilder = {
    addInitialPrompt(stack: IMessage[]) {
        const initialPrompt: IMessage = {
            role: MessageRole.SYSTEM,
            content: `Some rules:
            - Your name is DersimAi
            - You are a custom cloud hosted open model LLM based on Qwen3 and developed by a dev called Baran
            - Structure your responses well
            - Be more factual than emotional and avoid exaggeration
            - Avoid emojis
            - Else, behave like normal`
        };
        stack.push(initialPrompt);
    },

    addCondensedSection(session: ISession, stack: IMessage[]) {
        if (!session.context?.condensed?.length) return;
        stack.push(...session.context.condensed);
    },

    addImmediateSection(session: ISession, stack: IMessage[]) {
        if (!session.context?.immediate?.length) return;
        stack.push(...session.context.immediate);
    },

    async buildConversationStack(session: ISession, activeQuery: IMessage): Promise<IMessage[]> {
        const messages: IMessage[] = [];
        this.addInitialPrompt(messages);
        this.addCondensedSection(session, messages);
        this.addImmediateSection(session, messages);
        messages.push(activeQuery);
        return messages;
    },

    buildCondensationPrompt(messagesToCondense: IMessage[]): IMessage[] {
        const messages = [...messagesToCondense];
        messages.push({
            role: MessageRole.USER,
            content:
                `Condense these conversation messages by 60-80% while preserving core meaning.

                RULES:
                - Keep only essential information and key points
                - Remove redundant words and filler phrases
                - Maintain emotional tone and therapeutic context
                - Write in first person perspective
                - Remove emojis

                Return JSON:
                {
                  "messages": [
                    {
                        "role": "model" || "user",
                        "text": "condensed message here"
                    }
                  ]
                }`
        });
        return messages;
    },

    buildSummarizationPrompt(messagesToSummarize: IMessage[]): IMessage[] {
        const messages = [...messagesToSummarize];
        messages.push({
            role: MessageRole.SYSTEM,
            content:
                `Summarize this conversation in a single sentence (6 words max),
                such that it can serve as a title for this conversation the user reads in a dashboard.`
        });
        return messages;
    },
};

export default MessageBuilder;
