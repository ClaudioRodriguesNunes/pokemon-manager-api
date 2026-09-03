import { IPokemon } from '../entities/pokemon.js';

export interface IPokemonRepositoryContract {
  save(pokemon: IPokemon): Promise<void>;
  findAll(): Promise<IPokemon[]>;
  findById(id: string): Promise<IPokemon | null>;
  update(id: string, pokemon: IPokemon): Promise<IPokemon | null>;
}
