export interface ExternalPokemonDetails {
  spriteUrl: string | null;
  baseExperience: number | null;
  height: number | null;
  weight: number | null;
}

export interface PokemonExternalGateway {
  findByName(name: string): Promise<ExternalPokemonDetails | null>;
}
