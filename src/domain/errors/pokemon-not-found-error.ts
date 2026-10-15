import { ResourceNotFoundError } from './resource-not-found-error.js';

export class PokemonNotFoundError extends ResourceNotFoundError {
  constructor() {
    super('Pokémon não encontrado.');
    this.name = 'PokemonNotFoundError';
  }
}
