// Constants moved to top of file for better visibility and maintainability
export const CHAT_CONFIG = {
    DEEPSEEK: {
        BASE_URL: 'https://api.deepseek.com',
        MODEL: "deepseek-chat",
        TEMPERATURE: 1.3,
        MAX_TOKENS: 1024,
    },
    GEMINI: {
        BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        MODEL: "gemini-2.5-flash-lite-preview-06-17",
        TEMPERATURE: 1.3,
        MAX_TOKENS: 1024,
    }
};

export const CONTEXT_CONFIG = {
    IMMEDIATE: {
        CONTEXT_WINDOW: 2048,
        TRIM_RATIO: 0.25,
        TEMPERATURE: 1.3,
    },
    CONDENSATION: {
        CONTEXT_WINDOW: 2048,
        TRIM_RATIO: 0.25,
        TEMPERATURE: 1.0
    },
    SUMMARY: {
        CONTEXT_WINDOW: 2048,
        TEMPERATURE: 1.0,
    },
};
