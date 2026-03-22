import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@dersim/shared';

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body);
        if (error) {
            const errors: Record<string, string> = {};
            error.details.forEach(detail => {
                errors[detail.path[0]] = detail.message;
            });
            next(new ValidationError(errors));
        } else {
            next();
        }
    };
};

// User validation schemas
export const authSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Username is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long'
    })
}).unknown(false);

export const chatSchema = Joi.object({
    content: Joi.string().required().messages({
        'string.empty': 'Message text is required'
    }),
}).unknown(false);

