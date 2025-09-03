"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalServiceError = exports.DatabaseError = exports.ValidationError = exports.AccessDeniedError = exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class AccessDeniedError extends Error {
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'AccessDeniedError';
    }
}
exports.AccessDeniedError = AccessDeniedError;
class ValidationError extends Error {
    constructor(message = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class DatabaseError extends Error {
    constructor(message = 'Database operation failed') {
        super(message);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class ExternalServiceError extends Error {
    constructor(message = 'External service error') {
        super(message);
        this.name = 'ExternalServiceError';
    }
}
exports.ExternalServiceError = ExternalServiceError;
