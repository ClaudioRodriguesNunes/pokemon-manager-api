import { CreateTrainerDTO } from '../dtos/trainer-dto.js';
import { Trainer } from '../../domain/entities/trainer.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';

export class CreateTrainerUseCase {
  constructor(private trainerRepository: ITrainerRepository) {}

  async execute(input: CreateTrainerDTO): Promise<Trainer> {
    new Trainer({ id: '', ...input });
    return this.trainerRepository.create(input);
  }
}
