import { z } from 'zod';

const pokemonTypes = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic'] as const;

const pokemonAttributes = {
  name: z.string().trim().min(1, 'Nome deve ser uma string não vazia.'),
  type: z.enum(pokemonTypes),
  hp: z.number().int().positive(),
  attack: z.number().int().positive(),
  defense: z.number().int().positive(),
};

export const createPokemonSchema = z.object(pokemonAttributes).strict();

export const updatePokemonSchema = z.object(pokemonAttributes).strict();

export const pokemonIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido.'),
});

export const listPokemonsQuerySchema = z
  .object({
    type: z.enum(pokemonTypes).optional(),
  })
  .strict();
