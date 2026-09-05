import { IPokemonRepository } from '../../domain/repositories/pokemon-repository.js';

interface PokemonStats {
  totalPokemons: number;
  typesCount: Record<string, number>;
}

export class GetPokemonStatsUseCase {
  constructor(private pokemonRepository: IPokemonRepository) {}

  async execute(): Promise<PokemonStats> {
    const pokemons = await this.pokemonRepository.findAll();

    const typesCount = pokemons.reduce<Record<string, number>>(
      (accumulator, pokemon) => {
        accumulator[pokemon.type] = (accumulator[pokemon.type] ?? 0) + 1;
        return accumulator;
      },
      {},
    );

    return {
      totalPokemons: pokemons.length,
      typesCount,
    };
  }
}
