import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { ExternalGatewayError } from '../../domain/errors/external-gateway-error.js';
import {
  ExternalPokemonDetails,
  PokemonExternalGateway,
} from '../../domain/gateways/pokemon-external-gateway.js';

const pokeApiResponseSchema = z.object({
  sprites: z
    .object({
      other: z
        .object({
          'official-artwork': z
            .object({
              front_default: z.string().nullable().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  base_experience: z.number().int().nullable().optional(),
  height: z.number().int().nullable().optional(),
  weight: z.number().int().nullable().optional(),
});

export class PokeApiAxiosGateway implements PokemonExternalGateway {
  async findByName(name: string): Promise<ExternalPokemonDetails | null> {
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.trim().toLowerCase())}`,
        { timeout: 3000 },
      );

      const parsed = pokeApiResponseSchema.safeParse(response.data);
      if (!parsed.success) {
        throw new ExternalGatewayError();
      }

      return {
        spriteUrl:
          parsed.data.sprites?.other?.['official-artwork']?.front_default ??
          null,
        baseExperience: parsed.data.base_experience ?? null,
        height: parsed.data.height ?? null,
        weight: parsed.data.weight ?? null,
      };
    } catch (error) {
      if (error instanceof ExternalGatewayError) {
        throw error;
      }

      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }

      throw new ExternalGatewayError();
    }
  }
}
