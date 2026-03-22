// errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Logger, TAG } from '../helper/logger';
import { HttpStatus } from '@dersim/shared';
import { AppError } from '@dersim/shared';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  Logger.error(TAG.ERROR_HANDLER, err);
  
  // Default error response
  let statusCode = HttpStatus.INTERNAL_ERROR;
  let errorResponse: any;
  
  // Handle different error types
  if (err instanceof AppError) {
    statusCode = err.statusCode || HttpStatus.INTERNAL_ERROR;
    errorResponse = err.toJson();
  } 
  // Handle Mongoose errors
  else if (err instanceof mongoose.Error) {
    if (err instanceof mongoose.Error.ValidationError) {
      statusCode = 400;
      errorResponse = {
        status: 'error',
        message: 'Validation error',
        errorCode: 'VALIDATION_ERROR'
      };
    } else if (err instanceof mongoose.Error.CastError) {
      statusCode = 400;
      errorResponse = {
        status: 'error',
        message: `Invalid ${err.path}: ${err.value}`,
        errorCode: 'INVALID_ID'
      };
    } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
      statusCode = 409;
      errorResponse = {
        status: 'error',
        message: 'Duplicate key error',
        errorCode: 'DUPLICATE_KEY'
      };
    }
  }
  // Send response
  res.status(statusCode).json(errorResponse);
};



export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    res.status(HttpStatus.NOT_FOUND).json('Route does not exist');
}
