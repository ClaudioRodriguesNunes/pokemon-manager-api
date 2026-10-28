import { CreateTrainerProps, Trainer } from '../entities/trainer.js';

export interface ITrainerRepository {
  findAll(): Promise<Trainer[]>;
  findById(id: string): Promise<Trainer | null>;
  findByName(name: string): Promise<Trainer[]>;
  create(input: CreateTrainerProps): Promise<Trainer>;
}
