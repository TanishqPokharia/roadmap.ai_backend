export class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}
export class AccessDeniedError extends Error {
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'AccessDeniedError';
    }
}
export class ValidationError extends Error {
    constructor(message = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
    }
}
export class DatabaseError extends Error {
    constructor(message = 'Database operation failed') {
        super(message);
        this.name = 'DatabaseError';
    }
}
export class ExternalServiceError extends Error {
    constructor(message = 'External service error') {
        super(message);
        this.name = 'ExternalServiceError';
    }
}
