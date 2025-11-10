"use strict";
// Fait à l'aide de ChatGPT
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    details;
    constructor(message, options = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = options.statusCode ?? 500;
        this.code = options.code ?? "INTERNAL_ERROR";
        this.isOperational = options.isOperational ?? true;
        this.details = options.details;
        if (options.cause)
            this.cause = options.cause;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map