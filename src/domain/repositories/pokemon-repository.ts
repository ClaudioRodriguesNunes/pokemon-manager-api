import { Pokemon } from '../entities/pokemon.js';
import { CreatePokemonProps } from '../entities/pokemon.js';

export interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
  findByType(type: string): Promise<Pokemon[]>;
  findById(id: string): Promise<Pokemon | null>;
  create(input: CreatePokemonProps): Promise<Pokemon>;
  update(pokemon: Pokemon): Promise<void>;
  delete(id: string): Promise<void>;
}
