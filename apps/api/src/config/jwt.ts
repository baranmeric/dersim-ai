import jwt from 'jsonwebtoken';
import config from "../config";
import { IUser } from '../schema/user';

export const generateToken = (user: IUser): string => {
    return jwt.sign(
        { id: user._id, name: user.name },
        config.jwt_secret,
        { expiresIn: '72000h' } // TODO: Set to 24h in production
    );
};

export const verifyToken = (token: string): jwt.JwtPayload => {
    return jwt.verify(token, config.jwt_secret) as jwt.JwtPayload;
};
