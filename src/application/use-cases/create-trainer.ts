import { CreateTrainerDTO } from '../dtos/trainer-dto.js';
import { Trainer } from '../../domain/entities/trainer.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';
import { DuplicateTrainerNameError } from '../../domain/errors/duplicate-trainer-name-error.js';
import { normalizeName } from '../../domain/normalization/name-normalizer.js';

export class CreateTrainerUseCase {
  constructor(private trainerRepository: ITrainerRepository) {}

  async execute(input: CreateTrainerDTO): Promise<Trainer> {
    const normalizedInput = { ...input, name: input.name.trim() };
    new Trainer({ id: '', ...normalizedInput });

    const existing = await this.trainerRepository.findByName(
      normalizeName(normalizedInput.name),
    );
    if (
      existing.some(
        (trainer) =>
          normalizeName(trainer.name) === normalizeName(normalizedInput.name),
      )
    ) {
      throw new DuplicateTrainerNameError();
    }

    return this.trainerRepository.create(normalizedInput);
  }
}
