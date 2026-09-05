import { PokemonType } from '../../domain/entities/pokemon.js';

export interface CreatePokemonDTO {
  id: string;
  name: string;
  type: PokemonType;
  hp: number;
  attack: number;
  defense: number;
}

export interface UpdatePokemonDTO {
  name: string;
  type: PokemonType;
  hp: number;
  attack: number;
  defense: number;
}
