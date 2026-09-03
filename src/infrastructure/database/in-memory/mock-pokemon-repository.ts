import { IPokemon } from '../../../domain/entities/pokemon.js';
import { IPokemonRepositoryContract } from '../../../domain/repositories/pokemon-repository.js';

export class MockPokemonRepository implements IPokemonRepositoryContract {
  private pokemons: IPokemon[] = [];

  async save(pokemon: IPokemon): Promise<void> {
    this.pokemons.push(pokemon);
  }

  async findAll(): Promise<IPokemon[]> {
    return this.pokemons;
  }

  async findById(id: string): Promise<IPokemon | null> {
    const pokemon = this.pokemons.find((pokemon) => pokemon.id === id);

    return pokemon ?? null;
  }

  async update(id: string, pokemon: IPokemon): Promise<IPokemon | null> {
    const index = this.pokemons.findIndex(
      (currentPokemon) => currentPokemon.id === id,
    );

    if (index === -1) {
      return null;
    }

    this.pokemons[index] = pokemon;

    return pokemon;
  }
}
