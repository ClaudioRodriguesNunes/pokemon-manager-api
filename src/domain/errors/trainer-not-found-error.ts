import { ResourceNotFoundError } from './resource-not-found-error.js';

export class TrainerNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Treinador não encontrado.');
    this.name = 'TrainerNotFoundError';
  }
}
