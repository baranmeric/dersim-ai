import bcrypt from 'bcrypt';
import { createServiceProxy } from '@dersim/api/core';
import { EntityNotFoundError, UnauthorizedError, ConflictError, IUserDto, IAuthData, IUserRequest } from '@dersim/shared';
import User, { IUser } from '../schema/user';
import { generateToken } from '../jwt';

const UserService = {
    async getAllUsers(): Promise<IUserDto[]> {
        const users = await User.find({}, { passwordHash: 0 });
        return users.map(user => user.toDto());
    },

    async getUserById(id: string): Promise<IUserDto> {
        const user = await User.findById(id, { passwordHash: 0 });
        if (!user) {
            throw new EntityNotFoundError('User', id);
        }
        return user.toDto();
    },

    async deleteUser(id: string): Promise<string> {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new EntityNotFoundError('User', id);
        }
        return `user with id ${id} deleted successfully`;
    },

    async login(loginRequest: IUserRequest): Promise<IAuthData> {
        const user = await User.findOne({ name: loginRequest.name });
        if (!user) {
            throw new UnauthorizedError('Invalid username or password');
        }
        const isPasswordValid = await user.comparePassword(loginRequest.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid username or password');
        }
        return this.createAuthData(user);
    },

    async createUser(userRequest: IUserRequest): Promise<IAuthData> {
        const existingUser = await User.findOne({ name: userRequest.name });
        if (existingUser) {
            throw new ConflictError('Username already exists');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userRequest.password, salt);
        const user = await User.create({ name: userRequest.name, passwordHash });
        return this.createAuthData(user);
    },

    createAuthData(user: IUser): IAuthData {
        const token = generateToken(user);
        const userDto = user.toDto();
        return { user: userDto, token };
    },
};

export default createServiceProxy(UserService);
