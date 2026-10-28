import { AppError } from './app-error.js';

export class DuplicateTrainerNameError extends AppError {
  constructor() {
    super('Nome de Treinador já cadastrado.', 409);
    this.name = 'DuplicateTrainerNameError';
  }
}
