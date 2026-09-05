import { UpdatePokemonDTO } from '../dtos/pokemon-dto.js';
import { Pokemon } from '../../domain/entities/pokemon.js';
import { ResourceNotFoundError } from '../../domain/errors/resource-not-found-error.js';
import { IPokemonRepository } from '../../domain/repositories/pokemon-repository.js';

interface UpdatePokemonInput extends UpdatePokemonDTO {
  id: string;
}

export class UpdatePokemonUseCase {
  constructor(private pokemonRepository: IPokemonRepository) {}

  async execute(input: UpdatePokemonInput): Promise<Pokemon> {
    const pokemon = await this.pokemonRepository.findById(input.id);

    if (!pokemon) {
      throw new ResourceNotFoundError('Pokémon não encontrado no catálogo.');
    }

    pokemon.update({
      name: input.name,
      type: input.type,
      hp: input.hp,
      attack: input.attack,
      defense: input.defense,
    });

    await this.pokemonRepository.update(pokemon);

    return pokemon;
  }
}
