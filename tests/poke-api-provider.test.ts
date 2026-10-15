import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AxiosError } from 'axios';
import { ExternalGatewayError } from '../src/domain/errors/external-gateway-error.js';
import { PokeApiProvider } from '../src/infrastructure/providers/poke-api-provider.js';

const completePayload = {
  id: 6,
  name: 'charizard',
  sprites: {
    other: {
      'official-artwork': {
        front_default: 'https://example.test/charizard.png',
      },
    },
  },
  types: [
    { slot: 2, type: { name: 'flying' } },
    { slot: 1, type: { name: 'fire' } },
  ],
  stats: [
    { base_stat: 100, stat: { name: 'speed' } },
    { base_stat: 85, stat: { name: 'special-defense' } },
    { base_stat: 109, stat: { name: 'special-attack' } },
    { base_stat: 78, stat: { name: 'defense' } },
    { base_stat: 84, stat: { name: 'attack' } },
    { base_stat: 78, stat: { name: 'hp' } },
  ],
  base_experience: 267,
  height: 17,
  weight: 905,
  ignored_external_field: true,
};

function clientReturning(data: unknown) {
  return {
    get: async (_url: string, _config?: unknown) => ({ data }),
  };
}

test('maps a valid response, ordering types by slot and stats by name', async () => {
  let requestedUrl: string | undefined;
  let requestedTimeout: number | undefined;
  const provider = new PokeApiProvider({
    get: async (url, config) => {
      requestedUrl = url;
      requestedTimeout = config?.timeout;
      return { data: completePayload };
    },
  });

  const result = await provider.findByName('  CHARIZARD mega/x  ');

  assert.equal(
    requestedUrl,
    'https://pokeapi.co/api/v2/pokemon/charizard%20mega%2Fx/',
  );
  assert.equal(requestedTimeout, 3000);
  assert.deepEqual(result, {
    pokeApiId: 6,
    name: 'charizard',
    spriteUrl: 'https://example.test/charizard.png',
    types: ['fire', 'flying'],
    stats: {
      hp: 78,
      attack: 84,
      defense: 78,
      specialAttack: 109,
      specialDefense: 85,
      speed: 100,
    },
    baseExperience: 267,
    height: 17,
    weight: 905,
  });
});

test('maps absent or null optional fields to null', async () => {
  const payload = {
    ...completePayload,
    sprites: { other: { 'official-artwork': { front_default: null } } },
    base_experience: null,
  };
  delete (payload as Partial<typeof payload>).height;
  delete (payload as Partial<typeof payload>).weight;

  const result = await new PokeApiProvider(clientReturning(payload)).findByName(
    'charizard',
  );

  assert.equal(result?.spriteUrl, null);
  assert.equal(result?.baseExperience, null);
  assert.equal(result?.height, null);
  assert.equal(result?.weight, null);
});

test('returns null only for an Axios 404 response', async () => {
  const error = new AxiosError(
    'not found',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    { status: 404, data: {}, headers: {}, config: {} as never },
  );
  const provider = new PokeApiProvider({
    get: async () => Promise.reject(error),
  });

  assert.equal(await provider.findByName('missingno'), null);
});

for (const scenario of [
  {
    name: 'timeout',
    error: new AxiosError('timeout', 'ECONNABORTED'),
  },
  {
    name: 'network failure',
    error: new AxiosError('network error', 'ERR_NETWORK'),
  },
  {
    name: 'unexpected HTTP response',
    error: new AxiosError(
      'server error',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      { status: 500, data: {}, headers: {}, config: {} as never },
    ),
  },
]) {
  test(`converts ${scenario.name} into the operational external error`, async () => {
    const provider = new PokeApiProvider({
      get: async () => Promise.reject(scenario.error),
    });

    await assert.rejects(
      () => provider.findByName('pikachu'),
      (error: ExternalGatewayError) =>
        error instanceof ExternalGatewayError &&
        error.statusCode === 503 &&
        error.isOperational,
    );
  });
}

test('rejects an invalid payload with a required field missing', async () => {
  const payloadWithoutId: Record<string, unknown> = { ...completePayload };
  delete payloadWithoutId.id;
  const provider = new PokeApiProvider(clientReturning(payloadWithoutId));

  await assert.rejects(
    () => provider.findByName('charizard'),
    ExternalGatewayError,
  );
});

test('rejects a payload without all six required named stats', async () => {
  const payload = {
    ...completePayload,
    stats: completePayload.stats.filter((item) => item.stat.name !== 'speed'),
  };
  const provider = new PokeApiProvider(clientReturning(payload));

  await assert.rejects(
    () => provider.findByName('charizard'),
    ExternalGatewayError,
  );
});
