import { HttpStatus } from "../enum/httpStatus";

export enum AppErrorType {
    ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
    CONFLICT = "CONFLICT",
    VALIDATION = "VALIDATION",
    PARAMETER = "PARAMETER",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    INTERNAL = "INTERNAL",
    AI = "AI",
    DATABASE = "DATABASE",
    PARSING = "PARSING",
}

// Base error class
export class AppError extends Error {
    public statusCode: number;
    public errorType?: AppErrorType;
    public error?: any;
    public isOperational: boolean;

    static fromJson(json: any): AppError {
        const error = new AppError(
            json.statusCode || HttpStatus.INTERNAL_ERROR,
            json.errorType || AppErrorType.INTERNAL,
            json.message || 'Unknown error',
            json.data,
            json.isOperational !== false
        );
        return error;
    }

    static fromError(error: any): AppError {
        const appError = new AppError(
            error.statusCode || 500,
            error.errorType || AppErrorType.INTERNAL,
            error.message || 'Unknown error',
        );
        return appError;
    }

    static withMessage(message: string): AppError {
        const appError = new AppError(
            500,
            AppErrorType.INTERNAL,
            message,
        );
        return appError;
    }

    static getErrorType(error: any): AppErrorType | undefined {
        if (!(error instanceof AppError)) return undefined;
        return error.errorType;
    }


    constructor(statusCode: number, errorType: AppErrorType, message: string, error?: any, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorType = errorType || AppErrorType.INTERNAL;
        this.error = error;
    }

    toJson() {
        return {
            message: this.message,
            errorType: this.errorType,
            statusCode: this.statusCode,
            error: this.error,
            // stack: this.stack,
        }
    }
}

// Database errors
export class DatabaseError extends AppError {
    constructor(message: string, errorCode?: string) {
        super(500, AppErrorType.DATABASE, message, errorCode);
    }
}

export class EntityNotFoundError extends AppError {
    constructor(entityType: string, id: string) {
        super(404, AppErrorType.ENTITY_NOT_FOUND, `${entityType} with id ${id} not found`);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, AppErrorType.CONFLICT, message);
    }
}

// Validation errors
export class ValidationError extends AppError {
    constructor(errors: Record<string, string>) {
        super(400, AppErrorType.VALIDATION, 'Validation failed', errors);
    }
}

export class ParamError extends AppError {
    constructor(paramName: string, error?: any) {
        super(400, AppErrorType.PARAMETER, `${paramName} must be set`, error);
    }
}

// Authentication errors
export class UnauthorizedError extends AppError {
    constructor(message: string, error?: any) {
        super(401, AppErrorType.UNAUTHORIZED, message, error);
    }
}

// Authorization errors
export class ForbiddenError extends AppError {
    constructor(message: string, error?: any) {
        super(403, AppErrorType.FORBIDDEN, message, error);
    }
}

// Internal errors
export class InternalError extends AppError {
    constructor(message: string, error?: any) {
        super(500, AppErrorType.INTERNAL, message, error);
    }
}

export class ParsingError extends AppError {
    constructor(message: string, error?: any) {
        super(500, AppErrorType.PARSING, message, error);
    }
}

// AI errors
export class AiError extends AppError {
    constructor(message: string, error?: any) {
        if (error) {
            super(500, AppErrorType.AI, error?.message, error)
        } else {
            super(500, AppErrorType.AI, message);
        }
    }
}
