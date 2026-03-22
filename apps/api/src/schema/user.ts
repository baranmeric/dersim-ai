import { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUserDto } from '@dersim/shared';

export interface IUser extends Document {
    name: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;

    comparePassword(candidatePassword: string): Promise<boolean>;
    toDto(): IUserDto;
}

const UserSchema = new Schema({
    name: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true},

}, { timestamps: true});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.toDto = function(): IUserDto {
    return {
        id: this._id,
        name: this.name,
    }
}

export default model<IUser>('User', UserSchema);
