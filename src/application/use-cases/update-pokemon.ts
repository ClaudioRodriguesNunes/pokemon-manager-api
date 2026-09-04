import { Pokemon, PokemonType } from '../../domain/entities/pokemon.js';
import { ResourceNotFoundError } from '../../domain/errors/resource-not-found-error.js';
import { IPokemonRepository } from '../../domain/repositories/pokemon-repository.js';

interface UpdatePokemonInput {
  id: string;
  name: string;
  type: PokemonType;
  hp: number;
  attack: number;
  defense: number;
}

export class UpdatePokemonUseCase {
  constructor(private pokemonRepository: IPokemonRepository) {}

  async execute(input: UpdatePokemonInput): Promise<Pokemon> {
    const pokemon = await this.pokemonRepository.findById(input.id);

    if (!pokemon) {
      throw new ResourceNotFoundError('Pokémon não encontrado no catálogo.');
    }

    pokemon.name = input.name;
    pokemon.type = input.type;
    pokemon.hp = input.hp;
    pokemon.attack = input.attack;
    pokemon.defense = input.defense;

    await this.pokemonRepository.update(pokemon);

    return pokemon;
  }
}
