export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJson() {
    return {
      statusCode: this.statusCode,
      error: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

// 400 Bad request

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details?: unknown) {
    super(400, message, "BAD_REQUEST", details);
  }
}

// 401 Unauthorized

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication Required") {
    super(401, message, "UNAUTHORIZED");
  }
}

// 403 forbidden

export class ForbiddenError extends AppError {
  constructor(message = "Access Forbidden") {
    super(403, message, "FORBIDDEN");
  }
}

// 404 NOtfoudn

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, message, "NOT_FOUND");
  }
}

// 409 Conflict

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(409, message, "CONFLICT");
  }
}

// 422 validation

export class ValidationError extends AppError {
  constructor(message = "Validation Failed", details?: unknown) {
    super(422, message, "VALIDATION_ERROR", details);
  }
}

// 500 server fail

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(500, message, "INTERNAL_SERVER_ERROR");
  }
}
