import mongoose from "mongoose";

export const BaseMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'model'],
    },
    content: {
        type: String,
        required: true
    }
});

export const MessageSchema = new mongoose.Schema(BaseMessageSchema.obj, { timestamps: false, _id: false });
export const DisplayMessageSchema = new mongoose.Schema(BaseMessageSchema.obj, { timestamps: true, _id: false });
