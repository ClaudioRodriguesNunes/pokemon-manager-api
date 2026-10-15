import { PokemonNotFoundError } from '../../domain/errors/pokemon-not-found-error.js';
import {
  IPokeApiGateway,
  PokeApiPokemonData,
} from '../../domain/gateways/poke-api-gateway.js';

export class FindPokemonByNameUseCase {
  constructor(private pokeApiGateway: IPokeApiGateway) {}

  async execute(name: string): Promise<PokeApiPokemonData> {
    const pokemon = await this.pokeApiGateway.findByName(name);

    if (!pokemon) {
      throw new PokemonNotFoundError();
    }

    return pokemon;
  }
}
