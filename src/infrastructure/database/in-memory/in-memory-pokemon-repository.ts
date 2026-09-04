import { Pokemon } from '../../../domain/entities/pokemon.js';
import { IPokemonRepository } from '../../../domain/repositories/pokemon-repository.js';

export class InMemoryPokemonRepository implements IPokemonRepository {
  private pokemons: Pokemon[] = [];

  async findAll(): Promise<Pokemon[]> {
    return this.pokemons;
  }

  async findByType(type: string): Promise<Pokemon[]> {
    return this.pokemons.filter(
      (pokemon) => pokemon.type.toLowerCase() === type.toLowerCase(),
    );
  }

  async findById(id: string): Promise<Pokemon | null> {
    const pokemon = this.pokemons.find((pokemon) => pokemon.id === id);

    return pokemon ?? null;
  }

  async create(pokemon: Pokemon): Promise<void> {
    this.pokemons.push(pokemon);
  }

  async update(pokemon: Pokemon): Promise<void> {
    const index = this.pokemons.findIndex(
      (currentPokemon) => currentPokemon.id === pokemon.id,
    );

    if (index !== -1) {
      this.pokemons[index] = pokemon;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.pokemons.findIndex((pokemon) => pokemon.id === id);

    if (index !== -1) {
      this.pokemons.splice(index, 1);
    }
  }
}
