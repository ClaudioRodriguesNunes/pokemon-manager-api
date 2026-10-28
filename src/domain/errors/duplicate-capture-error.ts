import { AppError } from './app-error.js';

export class DuplicateCaptureError extends AppError {
  constructor() {
    super('Treinador já possui ou já possuiu este Pokémon.', 409);
    this.name = 'DuplicateCaptureError';
  }
}
