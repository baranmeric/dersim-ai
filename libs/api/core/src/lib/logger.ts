import chalk from "chalk";

export enum TAG {
    SYSTEM = "[SYS]",
    GEN_SESSION = "[GS]",
    GEN_USER = "[GU]",
    CHAT = "[CHAT]",
    AI = "[AI]",
    DEBUG = "[DBG]",
    QUEUE = "[QUE]",
    CONTEXT = "[CONTEXT]",
    SERVICE = "[SERVICE]",
    HTTP = "[HTTP]",
    ERROR = "[ERROR]",
    ERROR_HANDLER = "[ERROR_HANDLER]",
    DATABASE = "[DATABASE]",
    MESSAGE_BUILDER = "[MESSAGE_BUILDER]",
    UI = "[UI]",
    TEST = '[TEST]',
    CACHE = '[CACHE]',
}

const safeStringify = (obj: any, depth: number = 2): string => {
    try {
        return JSON.stringify(obj, null, depth);
    } catch (error) {
        return `[Object - Error serializing: ${error}]`;
    }
};

const formatLogData = (data: any[]): string[] => {
    return data.map(item => {
        if (typeof item === 'object' && item !== null) {
            return safeStringify(item);
        }
        return String(item);
    });
};

export const Logger = {
    log: (tag: TAG, ...data: any[]) => {
        console.log(tag, ...formatLogData(data));
    },

    info: (tag: TAG, ...data: any[]) => {
        console.info(chalk.cyan(tag), ...formatLogData(data));
    },

    warn: (tag: TAG, ...data: any[]) => {
        console.warn(chalk.yellow(tag), ...formatLogData(data));
    },

    error: (tag: TAG, ...data: any[]) => {
        console.error(chalk.red(tag), ...formatLogData(data));
    },

    debug: (...data: any[]) => {
        console.log(chalk.greenBright(TAG.DEBUG), ...formatLogData(data));
    },

    test: (...data: any[]) => {
        console.log(chalk.green(TAG.TEST), ...formatLogData(data));
    },

    object: (tag: TAG, obj: any, depth: number = 4) => {
        console.info(chalk.cyan(tag), safeStringify(obj, depth));
    }
};
