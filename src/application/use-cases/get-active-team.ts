import { PokemonCapture } from '../../domain/entities/pokemon-capture.js';
import { IPokemonCaptureRepository } from '../../domain/repositories/pokemon-capture-repository.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';
import { resolveTrainer, TrainerReference } from './resolve-trainer.js';

export class GetActiveTeamUseCase {
  constructor(
    private trainerRepository: ITrainerRepository,
    private captureRepository: IPokemonCaptureRepository,
  ) {}

  async execute(reference: TrainerReference): Promise<PokemonCapture[]> {
    const trainer = await resolveTrainer(this.trainerRepository, reference);

    return this.captureRepository.findActiveByTrainerId(trainer.id);
  }
}
