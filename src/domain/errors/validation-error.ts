import { AppError } from './app-error.js';

export class DomainValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'DomainValidationError';
  }
}
