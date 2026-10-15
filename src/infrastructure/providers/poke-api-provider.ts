import axios, { AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { ExternalGatewayError } from '../../domain/errors/external-gateway-error.js';
import {
  IPokeApiGateway,
  PokeApiPokemonData,
  PokemonBaseStats,
} from '../../domain/gateways/poke-api-gateway.js';

interface HttpClient {
  get(url: string, config?: AxiosRequestConfig): Promise<{ data: unknown }>;
}

const pokeApiResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  sprites: z
    .object({
      other: z
        .object({
          'official-artwork': z
            .object({
              front_default: z.string().url().nullable().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  types: z
    .array(
      z.object({
        slot: z.number().int().positive(),
        type: z.object({ name: z.string().trim().min(1) }),
      }),
    )
    .min(1),
  stats: z.array(
    z.object({
      base_stat: z.number().int().nonnegative(),
      stat: z.object({ name: z.string() }),
    }),
  ),
  base_experience: z.number().int().nonnegative().nullable().optional(),
  height: z.number().int().nonnegative().nullable().optional(),
  weight: z.number().int().nonnegative().nullable().optional(),
});

const statNames = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
} as const;

export class PokeApiProvider implements IPokeApiGateway {
  constructor(private readonly httpClient: HttpClient = axios) {}

  async findByName(name: string): Promise<PokeApiPokemonData | null> {
    const normalizedName = encodeURIComponent(name.trim().toLowerCase());

    try {
      const response = await this.httpClient.get(
        `https://pokeapi.co/api/v2/pokemon/${normalizedName}/`,
        { timeout: 3000 },
      );
      const parsed = pokeApiResponseSchema.safeParse(response.data);

      if (!parsed.success) throw new ExternalGatewayError();

      const stats: Partial<PokemonBaseStats> = {};
      for (const item of parsed.data.stats) {
        const dtoName = statNames[item.stat.name as keyof typeof statNames];
        if (dtoName) stats[dtoName] = item.base_stat;
      }

      if (Object.keys(stats).length !== Object.keys(statNames).length) {
        throw new ExternalGatewayError();
      }

      return {
        pokeApiId: parsed.data.id,
        name: parsed.data.name,
        spriteUrl:
          parsed.data.sprites?.other?.['official-artwork']?.front_default ??
          null,
        types: [...parsed.data.types]
          .sort((left, right) => left.slot - right.slot)
          .map((item) => item.type.name),
        stats: stats as PokemonBaseStats,
        baseExperience: parsed.data.base_experience ?? null,
        height: parsed.data.height ?? null,
        weight: parsed.data.weight ?? null,
      };
    } catch (error) {
      if (error instanceof ExternalGatewayError) throw error;
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new ExternalGatewayError();
    }
  }
}
