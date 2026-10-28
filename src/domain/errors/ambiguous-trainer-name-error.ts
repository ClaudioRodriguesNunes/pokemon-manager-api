import { AppError } from './app-error.js';

export class AmbiguousTrainerNameError extends AppError {
  constructor() {
    super('Nome de Treinador corresponde a mais de um registro.', 409);
    this.name = 'AmbiguousTrainerNameError';
  }
}
