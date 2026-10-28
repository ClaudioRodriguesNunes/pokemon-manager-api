import {
  CreateTrainerProps,
  Trainer,
} from '../../../domain/entities/trainer.js';
import { ITrainerRepository } from '../../../domain/repositories/trainer-repository.js';
import { normalizeName } from '../../../domain/normalization/name-normalizer.js';
import { prisma } from './prisma-client.js';

export class PrismaTrainerRepository implements ITrainerRepository {
  async findAll(): Promise<Trainer[]> {
    const records = await prisma.trainer.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return records.map((record) => new Trainer(record));
  }

  async findById(id: string): Promise<Trainer | null> {
    const record = await prisma.trainer.findUnique({ where: { id } });
    return record ? new Trainer(record) : null;
  }

  async findByName(name: string): Promise<Trainer[]> {
    const records = await prisma.trainer.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return records.map((record) => new Trainer(record));
  }

  async create(input: CreateTrainerProps): Promise<Trainer> {
    const record = await prisma.trainer.create({
      data: {
        ...input,
        name: input.name.trim(),
        nameNormalized: normalizeName(input.name),
      },
    });
    return new Trainer(record);
  }
}
