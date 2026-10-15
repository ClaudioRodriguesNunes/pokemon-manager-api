import { ResourceNotFoundError } from './resource-not-found-error.js';

export class CaptureNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Captura não encontrada para este Treinador.');
    this.name = 'CaptureNotFoundError';
  }
}
