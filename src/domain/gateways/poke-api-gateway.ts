export interface PokemonBaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokeApiPokemonData {
  pokeApiId: number;
  name: string;
  spriteUrl: string | null;
  types: string[];
  stats: PokemonBaseStats;
  baseExperience: number | null;
  height: number | null;
  weight: number | null;
}

export interface IPokeApiGateway {
  findByName(name: string): Promise<PokeApiPokemonData | null>;
}
