import { CreatePokemonDTO } from '../dtos/pokemon-dto.js';
import { Pokemon } from '../../domain/entities/pokemon.js';
import { IPokemonRepository } from '../../domain/repositories/pokemon-repository.js';
import { PokemonExternalGateway } from '../../domain/gateways/pokemon-external-gateway.js';
import { ResourceNotFoundError } from '../../domain/errors/resource-not-found-error.js';

export class CreatePokemonUseCase {
  constructor(
    private pokemonRepository: IPokemonRepository,
    private pokemonExternalGateway: PokemonExternalGateway,
  ) {}

  async execute(input: CreatePokemonDTO): Promise<Pokemon> {
    const externalDetails = await this.pokemonExternalGateway.findByName(
      input.name,
    );

    if (!externalDetails) {
      throw new ResourceNotFoundError(
        'Pokémon não encontrado na fonte externa.',
      );
    }

    return this.pokemonRepository.create({
      ...input,
      ...externalDetails,
    });
  }
}
