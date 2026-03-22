import { encoding_for_model } from "@dqbd/tiktoken";
import { ParsingError } from '@dersim/shared';
import { Logger } from './logger';
import { IMessage } from '@dersim/shared';

export interface ITokenPrice {
    input: number;
    output: number;
    total: number;
}

export const utils = {
    estimateTokenCount(messages: IMessage[], charsPerToken: number = 3): number {
        if (!messages.length) return 0;
        const encoder = encoding_for_model("gpt-3.5-turbo");
        let count = 0;
        messages.forEach(message => {
            if (message.content && message.content.length) {
                const tokens = encoder.encode(message.content).length + encoder.encode(message.role).length + 20;
                count += tokens;
            };
        });
        encoder.free();
        return count;
    },

    estimateTokenCost(input: number, output: number, inputPrice: number = 0.1, outputPrice: number = 0.4): ITokenPrice {
        const inputCost = input / 1000000 * inputPrice;
        const outputCost = output / 1000000 * outputPrice;
        return {
            input: inputCost,
            output: outputCost,
            total: inputCost + outputCost,
        };
    },

    parseAiResponseToJson(response: string): any {
        try {
            Logger.debug('RAW JSON', response);
            const cleanJsonString = response.trim().replace(/^```json|```$/g, "").trim();
            return JSON.parse(cleanJsonString);
        } catch (error) {
            throw new ParsingError(`Error parsing ${response} to JSON`, error);
        }
    },
};
