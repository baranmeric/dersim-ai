const config = {
    port: process.env.PORT || 8000,
    node_env: process.env.NODE_ENV || 'development',
    db_uri: process.env.MONGODB_URI || '',
    jwt_secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET environment variable is required'); })(),
    admin_secret: process.env.ADMIN_SECRET || '',
};

export default config;
