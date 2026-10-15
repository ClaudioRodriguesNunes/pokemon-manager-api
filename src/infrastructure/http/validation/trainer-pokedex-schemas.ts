import { z } from 'zod';

const uuid = z.string().uuid('ID deve ser um UUID válido.');
const nonEmptyText = (field: string) =>
  z.string().trim().min(1, `${field} deve ser uma string não vazia.`);

export const pokedexSearchQuerySchema = z
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

export const trainerParamsSchema = z.object({ trainerId: uuid }).strict();

export const capturePokemonSchema = z
  .object({ name: nonEmptyText('Nome') })
  .strict();

export const releaseCaptureParamsSchema = z
  .object({ trainerId: uuid, captureId: uuid })
  .strict();

export const emptyBodySchema = z.union([z.undefined(), z.object({}).strict()]);
