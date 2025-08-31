export class NotFoundError extends Error {
    constructor(message: string = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class AccessDeniedError extends Error {
    constructor(message: string = 'Access denied') {
        super(message);
        this.name = 'AccessDeniedError';
    }
}

export class ValidationError extends Error {
    constructor(message: string = 'Validation failed') {
        super(message);
        this.name = 'ValidationError';
    }
}

export class DatabaseError extends Error {
    constructor(message: string = 'Database operation failed') {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class ExternalServiceError extends Error {
    constructor(message: string = 'External service error') {
        super(message);
        this.name = 'ExternalServiceError';
    }
}
