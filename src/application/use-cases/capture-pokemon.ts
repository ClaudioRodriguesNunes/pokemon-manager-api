import { PokemonCapture } from '../../domain/entities/pokemon-capture.js';
import { PokemonNotFoundError } from '../../domain/errors/pokemon-not-found-error.js';
import { TrainerNotFoundError } from '../../domain/errors/trainer-not-found-error.js';
import { IPokeApiGateway } from '../../domain/gateways/poke-api-gateway.js';
import { IPokemonCaptureRepository } from '../../domain/repositories/pokemon-capture-repository.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';

export interface CapturePokemonInput {
  trainerId: string;
  pokemonName: string;
}

export class CapturePokemonUseCase {
  constructor(
    private trainerRepository: ITrainerRepository,
    private captureRepository: IPokemonCaptureRepository,
    private pokeApiGateway: IPokeApiGateway,
  ) {}

  async execute(input: CapturePokemonInput): Promise<PokemonCapture> {
    const trainer = await this.trainerRepository.findById(input.trainerId);
    if (!trainer) throw new TrainerNotFoundError();

    const pokemon = await this.pokeApiGateway.findByName(input.pokemonName);
    if (!pokemon) throw new PokemonNotFoundError();

    return this.captureRepository.createIfCapacity({
      trainerId: input.trainerId,
      ...pokemon,
    });
  }
}
