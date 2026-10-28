import { Prisma, PokemonCapture as PokemonCaptureRecord } from '@prisma/client';
import {
  CreatePokemonCaptureProps,
  PokemonCapture,
} from '../../../domain/entities/pokemon-capture.js';
import { ActiveCaptureLimitError } from '../../../domain/errors/active-capture-limit-error.js';
import { DuplicateCaptureError } from '../../../domain/errors/duplicate-capture-error.js';
import { TrainerNotFoundError } from '../../../domain/errors/trainer-not-found-error.js';
import { IPokemonCaptureRepository } from '../../../domain/repositories/pokemon-capture-repository.js';
import { prisma } from './prisma-client.js';

const MAX_ACTIVE_CAPTURES = 6;
const SERIALIZABLE_ATTEMPTS = 3;

export class PrismaPokemonCaptureRepository implements IPokemonCaptureRepository {
  async findAllByTrainerId(trainerId: string): Promise<PokemonCapture[]> {
    const records = await prisma.pokemonCapture.findMany({
      where: { trainerId },
      orderBy: { id: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findActiveByTrainerId(trainerId: string): Promise<PokemonCapture[]> {
    const records = await prisma.pokemonCapture.findMany({
      where: { trainerId, active: true },
      orderBy: { id: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<PokemonCapture | null> {
    const record = await prisma.pokemonCapture.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async createIfCapacity(
    input: CreatePokemonCaptureProps,
  ): Promise<PokemonCapture> {
    for (let attempt = 1; attempt <= SERIALIZABLE_ATTEMPTS; attempt += 1) {
      try {
        const record = await prisma.$transaction(
          async (transaction) => {
            const trainer = await transaction.trainer.findUnique({
              where: { id: input.trainerId },
              select: { id: true },
            });
            if (!trainer) throw new TrainerNotFoundError();

            const existingCapture = await transaction.pokemonCapture.findUnique(
              {
                where: {
                  trainerId_pokeApiId: {
                    trainerId: input.trainerId,
                    pokeApiId: input.pokeApiId,
                  },
                },
                select: { id: true },
              },
            );
            if (existingCapture) throw new DuplicateCaptureError();

            const activeCaptures = await transaction.pokemonCapture.count({
              where: { trainerId: input.trainerId, active: true },
            });
            if (activeCaptures >= MAX_ACTIVE_CAPTURES) {
              throw new ActiveCaptureLimitError();
            }

            return transaction.pokemonCapture.create({
              data: {
                trainerId: input.trainerId,
                pokeApiId: input.pokeApiId,
                name: input.name,
                types: [...input.types],
                hp: input.stats.hp,
                attack: input.stats.attack,
                defense: input.stats.defense,
                specialAttack: input.stats.specialAttack,
                specialDefense: input.stats.specialDefense,
                speed: input.stats.speed,
                spriteUrl: input.spriteUrl,
                baseExperience: input.baseExperience,
                height: input.height,
                weight: input.weight,
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
        return this.toDomain(record);
      } catch (error) {
        const retryable =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034';
        if (!retryable || attempt === SERIALIZABLE_ATTEMPTS) throw error;
      }
    }

    throw new Error('Unreachable serializable transaction state.');
  }

  async update(capture: PokemonCapture): Promise<void> {
    await prisma.pokemonCapture.updateMany({
      where: { id: capture.id, trainerId: capture.trainerId },
      data: { active: capture.active },
    });
  }

  private toDomain(record: PokemonCaptureRecord): PokemonCapture {
    return new PokemonCapture({
      id: record.id,
      trainerId: record.trainerId,
      active: record.active,
      pokeApiId: record.pokeApiId,
      name: record.name,
      types: [...record.types],
      stats: {
        hp: record.hp,
        attack: record.attack,
        defense: record.defense,
        specialAttack: record.specialAttack,
        specialDefense: record.specialDefense,
        speed: record.speed,
      },
      spriteUrl: record.spriteUrl,
      baseExperience: record.baseExperience,
      height: record.height,
      weight: record.weight,
    });
  }
}
