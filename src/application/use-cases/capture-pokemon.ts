import { PokemonCapture } from '../../domain/entities/pokemon-capture.js';
import { PokemonNotFoundError } from '../../domain/errors/pokemon-not-found-error.js';
import { DuplicateCaptureError } from '../../domain/errors/duplicate-capture-error.js';
import { IPokeApiGateway } from '../../domain/gateways/poke-api-gateway.js';
import { IPokemonCaptureRepository } from '../../domain/repositories/pokemon-capture-repository.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';
import { resolveTrainer, TrainerReference } from './resolve-trainer.js';

export interface CapturePokemonInput {
  trainerName?: string;
  trainerId?: string;
  pokemonName: string;
}

export class CapturePokemonUseCase {
  constructor(
    private trainerRepository: ITrainerRepository,
    private captureRepository: IPokemonCaptureRepository,
    private pokeApiGateway: IPokeApiGateway,
  ) {}

  async execute(input: CapturePokemonInput): Promise<PokemonCapture> {
    const reference: TrainerReference = input.trainerName
      ? { trainerName: input.trainerName }
      : { trainerId: input.trainerId as string };
    const trainer = await resolveTrainer(this.trainerRepository, reference);

    const pokemon = await this.pokeApiGateway.findByName(input.pokemonName);
    if (!pokemon) throw new PokemonNotFoundError();

    const history = await this.captureRepository.findAllByTrainerId(trainer.id);
    if (history.some((capture) => capture.pokeApiId === pokemon.pokeApiId)) {
      throw new DuplicateCaptureError();
    }

    return this.captureRepository.createIfCapacity({
      trainerId: trainer.id,
      ...pokemon,
    });
  }
}
