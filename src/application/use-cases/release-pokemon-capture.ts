import { PokemonCapture } from '../../domain/entities/pokemon-capture.js';
import { CaptureNotFoundError } from '../../domain/errors/capture-not-found-error.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';
import { IPokemonCaptureRepository } from '../../domain/repositories/pokemon-capture-repository.js';
import { normalizeName } from '../../domain/normalization/name-normalizer.js';
import { resolveTrainer } from './resolve-trainer.js';

export interface ReleasePokemonCaptureInput {
  trainerName?: string;
  pokemonName?: string;
  trainerId?: string;
  captureId?: string;
}

export class ReleasePokemonCaptureUseCase {
  constructor(
    private captureRepository: IPokemonCaptureRepository,
    private trainerRepository?: ITrainerRepository,
  ) {}

  async execute(input: ReleasePokemonCaptureInput): Promise<PokemonCapture> {
    let capture: PokemonCapture | null;

    if (input.trainerName !== undefined && input.pokemonName !== undefined) {
      if (!this.trainerRepository)
        throw new Error('Trainer repository required.');
      const trainer = await resolveTrainer(this.trainerRepository, {
        trainerName: input.trainerName,
      });
      const captures = await this.captureRepository.findAllByTrainerId(
        trainer.id,
      );
      capture =
        captures.find(
          (item) =>
            normalizeName(item.name) ===
            normalizeName(input.pokemonName as string),
        ) ?? null;
    } else {
      capture = input.captureId
        ? await this.captureRepository.findById(input.captureId)
        : null;
    }

    if (
      !capture ||
      (input.trainerId && capture.trainerId !== input.trainerId)
    ) {
      throw new CaptureNotFoundError();
    }

    capture.release();
    await this.captureRepository.update(capture);
    return capture;
  }
}
