import {
  CreateTrainerProps,
  Trainer,
} from '../../../domain/entities/trainer.js';
import { ITrainerRepository } from '../../../domain/repositories/trainer-repository.js';
import { prisma } from './prisma-client.js';

export class PrismaTrainerRepository implements ITrainerRepository {
  async findById(id: string): Promise<Trainer | null> {
    const record = await prisma.trainer.findUnique({ where: { id } });
    return record ? new Trainer(record) : null;
  }

  async create(input: CreateTrainerProps): Promise<Trainer> {
    const record = await prisma.trainer.create({ data: input });
    return new Trainer(record);
  }
}
