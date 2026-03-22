import { IMessage } from '@dersim/shared';
import crypto from 'crypto';

export default function generateMessagesHash(messages: IMessage[]): string {
    // Create a string representation of all messages without createdAt
    const messagesString = messages.map(msg =>
        `${msg.role}:${msg.content}`
    ).join('|');

    // Generate a SHA-256 hash
    const hash = crypto.createHash('sha256')
        .update(messagesString)
        .digest('hex');

    return hash;
}
