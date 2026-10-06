import { AppError } from './app-error.js';

export class ExternalGatewayError extends AppError {
  constructor() {
    super('Serviço externo temporariamente indisponível.', 503);
    this.name = 'ExternalGatewayError';
  }
}
