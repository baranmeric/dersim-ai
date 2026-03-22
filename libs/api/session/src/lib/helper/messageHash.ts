import { IMessage } from '@dersim/shared';
import crypto from 'crypto';

export default function generateMessagesHash(messages: IMessage[]): string {
    const messagesString = messages.map(msg => `${msg.role}:${msg.content}`).join('|');
    return crypto.createHash('sha256').update(messagesString).digest('hex');
}
