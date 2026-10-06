import {
  ExternalPokemonDetails,
  PokemonExternalGateway,
} from '../../domain/gateways/pokemon-external-gateway.js';

export class InMemoryPokemonGateway implements PokemonExternalGateway {
  private readonly pokemons = new Map<string, ExternalPokemonDetails>([
    [
      'pikachu',
      {
        spriteUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        baseExperience: 112,
        height: 4,
        weight: 60,
      },
    ],
    [
      'charmander',
      {
        spriteUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
        baseExperience: 62,
        height: 6,
        weight: 85,
      },
    ],
    [
      'bulbasaur',
      {
        spriteUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
        baseExperience: 64,
        height: 7,
        weight: 69,
      },
    ],
  ]);

  async findByName(name: string): Promise<ExternalPokemonDetails | null> {
    return this.pokemons.get(name.trim().toLowerCase()) ?? null;
  }
}
