import { PokemonCapture } from '../../domain/entities/pokemon-capture.js';
import { CaptureNotFoundError } from '../../domain/errors/capture-not-found-error.js';
import { IPokemonCaptureRepository } from '../../domain/repositories/pokemon-capture-repository.js';

export interface ReleasePokemonCaptureInput {
  trainerId: string;
  captureId: string;
}

export class ReleasePokemonCaptureUseCase {
  constructor(private captureRepository: IPokemonCaptureRepository) {}

  async execute(input: ReleasePokemonCaptureInput): Promise<PokemonCapture> {
    const capture = await this.captureRepository.findById(input.captureId);

    if (!capture || capture.trainerId !== input.trainerId) {
      throw new CaptureNotFoundError();
    }

    capture.release();
    await this.captureRepository.update(capture);
    return capture;
  }
}
