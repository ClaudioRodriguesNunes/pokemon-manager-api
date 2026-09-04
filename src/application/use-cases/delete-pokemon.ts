import { ResourceNotFoundError } from '../../domain/errors/resource-not-found-error.js';
import { IPokemonRepository } from '../../domain/repositories/pokemon-repository.js';

export class DeletePokemonUseCase {
  constructor(private pokemonRepository: IPokemonRepository) {}

  async execute(id: string): Promise<void> {
    const pokemon = await this.pokemonRepository.findById(id);

    if (!pokemon) {
      throw new ResourceNotFoundError('Pokémon não encontrado no catálogo.');
    }

    await this.pokemonRepository.delete(id);
  }
}
