import { z } from 'zod';

const nonEmptyText = (field: string) =>
  z.string().trim().min(1, `${field} deve ser uma string não vazia.`);

export const pokedexSearchQuerySchema = z
  .object({ name: nonEmptyText('Nome') })
  .strict();

export const trainerSearchQuerySchema = z
  .object({ name: nonEmptyText('Nome') })
  .strict();

export const createTrainerSchema = z
  .object({
    name: nonEmptyText('Nome'),
    age: z.number().int().positive('Idade deve ser um inteiro positivo.'),
    city: nonEmptyText('Cidade'),
    email: z.string().trim().email('E-mail deve ser válido.'),
  })
  .strict();

export const trainerNameParamsSchema = z
  .object({ trainerName: nonEmptyText('Nome do Treinador') })
  .strict();

export const releaseCaptureByNameParamsSchema = z
  .object({
    trainerName: nonEmptyText('Nome do Treinador'),
    pokemonName: nonEmptyText('Nome do Pokémon'),
  })
  .strict();

export const capturePokemonSchema = z
  .object({ name: nonEmptyText('Nome') })
  .strict();

export const emptyBodySchema = z.union([z.undefined(), z.object({}).strict()]);
