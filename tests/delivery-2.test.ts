import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createPokemonSchema,
  listPokemonsQuerySchema,
  pokemonIdSchema,
  updatePokemonSchema,
} from '../src/infrastructure/http/validation/pokemon-schemas.js';
import { InMemoryPokemonGateway } from '../src/infrastructure/gateways/in-memory-pokemon-gateway.js';
import { CreatePokemonUseCase } from '../src/application/use-cases/create-pokemon.js';
import { Pokemon } from '../src/domain/entities/pokemon.js';
import { CreatePokemonProps } from '../src/domain/entities/pokemon.js';
import { PokemonExternalGateway } from '../src/domain/gateways/pokemon-external-gateway.js';
import { IPokemonRepository } from '../src/domain/repositories/pokemon-repository.js';
import { ResourceNotFoundError } from '../src/domain/errors/resource-not-found-error.js';

test('schemas accept the approved POST and PUT contract', () => {
  const input = {
    name: 'Pikachu',
    type: 'Electric',
    hp: 35,
    attack: 55,
    defense: 40,
  };

  assert.equal(createPokemonSchema.safeParse(input).success, true);
  assert.equal(updatePokemonSchema.safeParse(input).success, true);
  assert.equal(
    createPokemonSchema.safeParse({ ...input, id: crypto.randomUUID() })
      .success,
    false,
  );
  assert.equal(
    createPokemonSchema.safeParse({ ...input, hp: 1.5 }).success,
    false,
  );
});

test('schemas validate UUIDs, type filter and reject invalid values', () => {
  assert.equal(pokemonIdSchema.safeParse({ id: crypto.randomUUID() }).success, true);
  assert.equal(pokemonIdSchema.safeParse({ id: '25' }).success, false);
  assert.equal(
    listPokemonsQuerySchema.safeParse({ type: 'Fire' }).success,
    true,
  );
  assert.equal(
    listPokemonsQuerySchema.safeParse({ type: 'Dragon' }).success,
    false,
  );
});

test('Pokemon serializes generated and nullable external fields', () => {
  const pokemon = new Pokemon({
    id: crypto.randomUUID(),
    name: 'Pikachu',
    type: 'Electric',
    hp: 35,
    attack: 55,
    defense: 40,
  });

  assert.equal(typeof pokemon.id, 'string');
  assert.deepEqual(pokemon.toJSON(), {
    id: pokemon.id,
    name: 'Pikachu',
    type: 'Electric',
    hp: 35,
    attack: 55,
    defense: 40,
    spriteUrl: null,
    baseExperience: null,
    height: null,
    weight: null,
  });
});

test('offline gateway returns required Pokémon and null for unknown names', async () => {
  const gateway = new InMemoryPokemonGateway();

  assert.equal((await gateway.findByName('pikachu'))?.baseExperience, 112);
  assert.equal((await gateway.findByName('CHARMANDER'))?.height, 6);
  assert.equal((await gateway.findByName('Bulbasaur'))?.weight, 69);
  assert.equal(await gateway.findByName('mewtwo'), null);
});

test('creation combines gateway details before calling the repository', async () => {
  let received: CreatePokemonProps | undefined;
  const repository: IPokemonRepository = {
    findAll: async () => [],
    findByType: async () => [],
    findById: async () => null,
    create: async (input) => {
      received = input;
      return new Pokemon({ id: crypto.randomUUID(), ...input });
    },
    update: async () => undefined,
    delete: async () => undefined,
  };
  const gateway: PokemonExternalGateway = {
    findByName: async () => ({
      spriteUrl: 'https://example.com/pikachu.png',
      baseExperience: 112,
      height: 4,
      weight: 60,
    }),
  };

  const created = await new CreatePokemonUseCase(repository, gateway).execute({
    name: 'Pikachu',
    type: 'Electric',
    hp: 35,
    attack: 55,
    defense: 40,
  });

  assert.equal(created.spriteUrl, 'https://example.com/pikachu.png');
  assert.equal(received?.baseExperience, 112);
  assert.equal(received?.height, 4);
});

test('creation rejects an unknown external Pokémon before persistence', async () => {
  let persisted = false;
  const repository = {
    create: async () => {
      persisted = true;
      throw new Error('should not persist');
    },
  } as unknown as IPokemonRepository;
  const gateway: PokemonExternalGateway = {
    findByName: async () => null,
  };

  await assert.rejects(
    () =>
      new CreatePokemonUseCase(repository, gateway).execute({
        name: 'Mewtwo',
        type: 'Psychic',
        hp: 106,
        attack: 110,
        defense: 90,
      }),
    ResourceNotFoundError,
  );
  assert.equal(persisted, false);
});
