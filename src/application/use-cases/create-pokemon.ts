import { Pokemon, PokemonType } from '../../domain/entities/pokemon.js';
import { IPokemonRepository } from '../../domain/repositories/pokemon-repository.js';

interface CreatePokemonInput {
  id: string;
  name: string;
  type: PokemonType;
  hp: number;
  attack: number;
  defense: number;
}

export class CreatePokemonUseCase {
  constructor(private pokemonRepository: IPokemonRepository) {}

  async execute(input: CreatePokemonInput): Promise<Pokemon> {
    const pokemonAlreadyExists = await this.pokemonRepository.findById(
      input.id,
    );

    if (pokemonAlreadyExists) {
      throw new Error('Pokémon já cadastrado.');
    }

    const pokemon = new Pokemon({
      id: input.id,
      name: input.name,
      type: input.type,
      hp: input.hp,
      attack: input.attack,
      defense: input.defense,
    });

    await this.pokemonRepository.create(pokemon);

    return pokemon;
  }
}
