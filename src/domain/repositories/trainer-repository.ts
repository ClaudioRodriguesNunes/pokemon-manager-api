import { CreateTrainerProps, Trainer } from '../entities/trainer.js';

export interface ITrainerRepository {
  findById(id: string): Promise<Trainer | null>;
  create(input: CreateTrainerProps): Promise<Trainer>;
}
