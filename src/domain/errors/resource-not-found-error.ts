import { AppError } from './app-error.js';

export class ResourceNotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'ResourceNotFoundError';
  }
}
