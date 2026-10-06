import { CreatePokemonDTO } from '../dtos/pokemon-dto.js';
import { Pokemon } from '../../domain/entities/pokemon.js';
import { IPokemonRepository } from '../../domain/repositories/pokemon-repository.js';

export class CreatePokemonUseCase {
  constructor(private pokemonRepository: IPokemonRepository) {}

  async execute(input: CreatePokemonDTO): Promise<Pokemon> {
    return this.pokemonRepository.create(input);
  }
}
