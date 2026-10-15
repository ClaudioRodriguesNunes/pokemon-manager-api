import {
  CreatePokemonCaptureProps,
  PokemonCapture,
} from '../entities/pokemon-capture.js';

export interface IPokemonCaptureRepository {
  findActiveByTrainerId(trainerId: string): Promise<PokemonCapture[]>;
  findById(id: string): Promise<PokemonCapture | null>;
  createIfCapacity(input: CreatePokemonCaptureProps): Promise<PokemonCapture>;
  update(capture: PokemonCapture): Promise<void>;
}
