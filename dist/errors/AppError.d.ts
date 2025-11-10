export type ErrorCode = "VALIDATION_ERROR" | "AUTH_INVALID_CREDENTIALS" | "INTERNAL_ERROR" | "AUTH_REQUIRED" | "FORBIDDEN" | "CANNOT_REGISTER_WHEN_LOGGED_IN" | "REMOTE_SERVICE_ERROR";
interface AppErrorOptions {
    statusCode?: number;
    code?: ErrorCode;
    isOperational?: boolean;
    details?: unknown;
    cause?: unknown;
}
export declare class AppError extends Error {
    statusCode: number;
    code: ErrorCode;
    isOperational: boolean;
    details?: unknown;
    constructor(message: string, options?: AppErrorOptions);
}
export {};
//# sourceMappingURL=AppError.d.ts.map