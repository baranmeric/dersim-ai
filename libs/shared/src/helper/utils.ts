import { InternalError } from "../error/app.error";

export const utils = {

    async wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    asEnum<T extends Object>(enumObject: T, value: string): T[keyof T] | never {
        if (Object.values(enumObject).includes(value as any)) {
            return value as T[keyof T];
        }
        const validValues = Object.values(enumObject).join(', ');
        throw new InternalError(`Invalid enum value: ${value} - Valid values: ${validValues}`);
    },
}
