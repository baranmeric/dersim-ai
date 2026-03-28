import { AiError, IMessage } from '@dersim/shared';
import Together from 'together-ai';

const together = new Together();

export interface StreamResponse {
    onChunk: (chunk: string) => void;
    onDone: () => void;
    onError: (error: AiError) => void;
}

const AiService = {
    async generateContent(messages: IMessage[]): Promise<string> {
        const completionMessages = this.getCompletionsMessages(messages);
        try {
            const response = await together.chat.completions.create({
                messages: completionMessages,
                model: "Qwen/Qwen3-Next-80B-A3B-Instruct"
            });
            const responseContent = response.choices?.[0].message?.content;
            if (!responseContent) throw new AiError('Empty response');
            return responseContent;
        } catch (error: unknown) {
            throw new AiError('AI error', error);
        }
    },

    async streamContent(messages: IMessage[], response: StreamResponse) {
        const completionMessages = this.getCompletionsMessages(messages);
        try {
            const stream = await together.chat.completions.create({
                messages: completionMessages,
                model: "Qwen/Qwen3-Next-80B-A3B-Instruct",
                stream: true,
            });
            for await (const event of stream) {
                const content = event.choices?.[0]?.delta?.content;
                if (!content) continue;
                response.onChunk(content);
            }
            response.onDone();
        } catch (error: unknown) {
            response.onError(new AiError('AI error', error));
        }
    },

    getCompletionsMessages(messages: IMessage[]): any[] {
        return messages.map(message => ({ role: message.role, content: message.content }));
    },
};

export default AiService;
