import { Trainer } from '../../domain/entities/trainer.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';

export class ListTrainersUseCase {
  constructor(private trainerRepository: ITrainerRepository) {}

  async execute(): Promise<Trainer[]> {
    return this.trainerRepository.findAll();
  }
}
