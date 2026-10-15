import { PokemonCapture } from '../../domain/entities/pokemon-capture.js';
import { TrainerNotFoundError } from '../../domain/errors/trainer-not-found-error.js';
import { IPokemonCaptureRepository } from '../../domain/repositories/pokemon-capture-repository.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';

export class GetActiveTeamUseCase {
  constructor(
    private trainerRepository: ITrainerRepository,
    private captureRepository: IPokemonCaptureRepository,
  ) {}

  async execute(trainerId: string): Promise<PokemonCapture[]> {
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) throw new TrainerNotFoundError();

    return this.captureRepository.findActiveByTrainerId(trainerId);
  }
}
