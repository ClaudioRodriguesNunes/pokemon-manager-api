import { AmbiguousTrainerNameError } from '../../domain/errors/ambiguous-trainer-name-error.js';
import { TrainerNotFoundError } from '../../domain/errors/trainer-not-found-error.js';
import { normalizeName } from '../../domain/normalization/name-normalizer.js';
import { ITrainerRepository } from '../../domain/repositories/trainer-repository.js';
import { Trainer } from '../../domain/entities/trainer.js';

export type TrainerReference =
  string | { trainerName: string } | { trainerId: string };

export async function resolveTrainer(
  repository: ITrainerRepository,
  reference: TrainerReference,
): Promise<Trainer> {
  if (typeof reference === 'string') {
    const byId = await repository.findById(reference);
    if (byId) return byId;
    return findUniqueByName(repository, reference);
  }

  if ('trainerId' in reference) {
    const trainer = await repository.findById(reference.trainerId);
    if (!trainer) throw new TrainerNotFoundError();
    return trainer;
  }

  return findUniqueByName(repository, reference.trainerName);
}

async function findUniqueByName(
  repository: ITrainerRepository,
  name: string,
): Promise<Trainer> {
  const normalizedName = normalizeName(name);
  const matches = (await repository.findByName(normalizedName)).filter(
    (trainer) => normalizeName(trainer.name) === normalizedName,
  );

  if (matches.length === 0) throw new TrainerNotFoundError();
  if (matches.length > 1) throw new AmbiguousTrainerNameError();
  return matches[0];
}
