const config = {
    port: process.env.PORT || 8000,
    node_env: process.env.NODE_ENV || 'development',
    db_uri: process.env.MONGODB_URI || (() => { throw new Error('MONGODB_URI environment variable is required'); })(),
    jwt_secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET environment variable is required'); })(),
    admin_secret: process.env.ADMIN_SECRET || '',
    cors_origins: (process.env.CORS_ORIGINS || 'http://localhost:4200,http://localhost:3000').split(','),
};

export default config;
