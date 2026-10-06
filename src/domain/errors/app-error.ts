export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: unknown[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 400,
    details: unknown[] = [],
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
  }
}
