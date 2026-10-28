export interface CreateTrainerDTO {
  name: string;
  age: number;
  city: string;
  email: string;
}

export interface TrainerNameParams {
  trainerName: string;
}

export interface ReleaseCaptureByNameParams extends TrainerNameParams {
  pokemonName: string;
}
