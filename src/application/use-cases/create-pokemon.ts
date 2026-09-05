import { CreatePokemonDTO } from '../dtos/pokemon-dto.js';
import { Pokemon } from '../../domain/entities/pokemon.js';
import { IPokemonRepository } from '../../domain/repositories/pokemon-repository.js';

export class CreatePokemonUseCase {
  constructor(private pokemonRepository: IPokemonRepository) {}

  async execute(input: CreatePokemonDTO): Promise<Pokemon> {
    const pokemonAlreadyExists = await this.pokemonRepository.findById(
      input.id,
    );

    if (pokemonAlreadyExists) {
      throw new Error('Pokémon já cadastrado.');
    }

    const pokemon = new Pokemon(input);

    await this.pokemonRepository.create(pokemon);

    return pokemon;
  }
}
