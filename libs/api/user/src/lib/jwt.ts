import jwt from 'jsonwebtoken';
import { config } from '@dersim/api/core';
import { IUser } from './schema/user';

export const generateToken = (user: IUser): string => {
    return jwt.sign(
        { id: user._id, name: user.name },
        config.jwt_secret,
        { expiresIn: '24h' }
    );
};
