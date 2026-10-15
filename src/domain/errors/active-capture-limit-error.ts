import { AppError } from './app-error.js';

export class ActiveCaptureLimitError extends AppError {
  constructor() {
    super('O Treinador já possui seis capturas ativas.', 409);
    this.name = 'ActiveCaptureLimitError';
  }
}
