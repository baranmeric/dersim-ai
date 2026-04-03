import jwt from 'jsonwebtoken';
import config from './config/environmentConfig';

export const verifyToken = (token: string): jwt.JwtPayload => {
    return jwt.verify(token, config.jwt_secret) as jwt.JwtPayload;
};
