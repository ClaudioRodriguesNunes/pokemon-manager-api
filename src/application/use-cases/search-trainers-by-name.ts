import { Trainer } from '../../domain/entities/trainer.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';

export class SearchTrainersByNameUseCase {
  constructor(private trainerRepository: ITrainerRepository) {}

  async execute(name: string): Promise<Trainer[]> {
    return this.trainerRepository.findByName(name.trim());
  }
}
