export enum PokemonType {
  FIRE = 'Fire',
  WATER = 'Water',
  GRASS = 'Grass',
  ELECTRIC = 'Electric',
  PSYCHIC = 'Psychic',
}

export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  LEGENDARY = 'Legendary',
}

export interface IPokemon {
  id: string;
  name: string;
  type: PokemonType;
  hp: number;
  rarity: Rarity;
  nickname?: string;
}
