const config = {
    port: process.env.PORT || 8000,
    node_env: process.env.NODE_ENV || 'development',
    db_uri: process.env.MONGODB_URI || '',
    jwt_secret: process.env.JWT_SECRET || '',
    gemini_api_key: process.env.GEMINI_API_KEY || '',
}

export default config;
