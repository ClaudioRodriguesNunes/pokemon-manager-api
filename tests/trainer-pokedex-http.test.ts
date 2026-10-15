import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Server } from 'node:http';
import { after, before, test } from 'node:test';
import { AddressInfo } from 'node:net';
import { Prisma } from '@prisma/client';
import { CapturePokemonUseCase } from '../src/application/use-cases/capture-pokemon.js';
import { CreateTrainerUseCase } from '../src/application/use-cases/create-trainer.js';
import { FindPokemonByNameUseCase } from '../src/application/use-cases/find-pokemon-by-name.js';
import { GetActiveTeamUseCase } from '../src/application/use-cases/get-active-team.js';
import { ReleasePokemonCaptureUseCase } from '../src/application/use-cases/release-pokemon-capture.js';
import {
  CreatePokemonCaptureProps,
  PokemonCapture,
} from '../src/domain/entities/pokemon-capture.js';
import { CreateTrainerProps, Trainer } from '../src/domain/entities/trainer.js';
import { ActiveCaptureLimitError } from '../src/domain/errors/active-capture-limit-error.js';
import { ExternalGatewayError } from '../src/domain/errors/external-gateway-error.js';
import {
  IPokeApiGateway,
  PokeApiPokemonData,
} from '../src/domain/gateways/poke-api-gateway.js';
import { IPokemonCaptureRepository } from '../src/domain/repositories/pokemon-capture-repository.js';
import { ITrainerRepository } from '../src/domain/repositories/trainer-repository.js';
import { PokedexController } from '../src/infrastructure/http/controllers/pokedex-controller.js';
import { TrainerController } from '../src/infrastructure/http/controllers/trainer-controller.js';
import { createApp } from '../src/main/app.js';

const pikachu: PokeApiPokemonData = {
  pokeApiId: 25,
  name: 'pikachu',
  spriteUrl: null,
  types: ['electric'],
  stats: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 50,
    speed: 90,
  },
  baseExperience: 112,
  height: 4,
  weight: 60,
};

class TrainerRepositoryStub implements ITrainerRepository {
  trainers: Trainer[] = [];

  async findById(id: string): Promise<Trainer | null> {
    return this.trainers.find((trainer) => trainer.id === id) ?? null;
  }

  async create(input: CreateTrainerProps): Promise<Trainer> {
    if (this.trainers.some((trainer) => trainer.email === input.email)) {
      throw new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      });
    }
    const trainer = new Trainer({ id: randomUUID(), ...input });
    this.trainers.push(trainer);
    return trainer;
  }
}

class CaptureRepositoryStub implements IPokemonCaptureRepository {
  captures: PokemonCapture[] = [];

  async findActiveByTrainerId(trainerId: string): Promise<PokemonCapture[]> {
    return this.captures.filter(
      (capture) => capture.trainerId === trainerId && capture.active,
    );
  }

  async findById(id: string): Promise<PokemonCapture | null> {
    return this.captures.find((capture) => capture.id === id) ?? null;
  }

  async createIfCapacity(
    input: CreatePokemonCaptureProps,
  ): Promise<PokemonCapture> {
    if (
      this.captures.filter(
        (capture) => capture.trainerId === input.trainerId && capture.active,
      ).length >= 6
    ) {
      throw new ActiveCaptureLimitError();
    }
    const capture = new PokemonCapture({
      id: randomUUID(),
      active: true,
      ...input,
    });
    this.captures.push(capture);
    return capture;
  }

  async update(_capture: PokemonCapture): Promise<void> {}
}

class GatewayStub implements IPokeApiGateway {
  mode: 'found' | 'missing' | 'unavailable' = 'found';
  receivedNames: string[] = [];

  async findByName(name: string): Promise<PokeApiPokemonData | null> {
    this.receivedNames.push(name);
    if (this.mode === 'missing') return null;
    if (this.mode === 'unavailable') throw new ExternalGatewayError();
    return pikachu;
  }
}

const trainers = new TrainerRepositoryStub();
const captures = new CaptureRepositoryStub();
const gateway = new GatewayStub();
const app = createApp({
  enableRequestLog: false,
  enableSwagger: false,
  dependencies: {
    pokedexController: new PokedexController(
      new FindPokemonByNameUseCase(gateway),
    ),
    trainerController: new TrainerController(
      new CreateTrainerUseCase(trainers),
      new CapturePokemonUseCase(trainers, captures, gateway),
      new GetActiveTeamUseCase(trainers, captures),
      new ReleasePokemonCaptureUseCase(captures),
    ),
  },
});

let server: Server;
let baseUrl: string;

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

async function request(
  path: string,
  init?: RequestInit,
): Promise<{ status: number; body: any }> {
  const response = await fetch(`${baseUrl}${path}`, init);
  return { status: response.status, body: await response.json() };
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { 'content-type': 'application/json' },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

test('search validates a strict query and returns the formatted gateway DTO', async () => {
  gateway.mode = 'found';
  const found = await request('/api/v1/pokedex/search?name=%20pikachu%20');
  assert.equal(found.status, 200);
  assert.deepEqual(found.body, { success: true, data: pikachu });
  assert.equal(gateway.receivedNames.at(-1), 'pikachu');

  for (const path of [
    '/api/v1/pokedex/search',
    '/api/v1/pokedex/search?name=',
    '/api/v1/pokedex/search?name=pikachu&extra=true',
    '/api/v1/pokedex/search?name=pikachu&name=raichu',
  ]) {
    const invalid = await request(path);
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.status, 'error');
    assert.ok(invalid.body.details.length > 0);
  }
});

test('search maps missing and unavailable external Pokémon', async () => {
  gateway.mode = 'missing';
  assert.equal(
    (await request('/api/v1/pokedex/search?name=missingno')).status,
    404,
  );
  gateway.mode = 'unavailable';
  assert.equal(
    (await request('/api/v1/pokedex/search?name=pikachu')).status,
    503,
  );
  gateway.mode = 'found';
});

test('legacy Pokemon CRUD routes are not exposed by the application', async () => {
  const legacyRequests: Array<[string, RequestInit?]> = [
    ['/api/v1/pokemons'],
    ['/api/v1/pokemons?type=Electric'],
    ['/api/v1/pokemons/stats'],
    [`/api/v1/pokemons/${randomUUID()}`],
    ['/api/v1/pokemons', json('POST', {})],
    [`/api/v1/pokemons/${randomUUID()}`, json('PUT', {})],
    [`/api/v1/pokemons/${randomUUID()}`, { method: 'DELETE' }],
  ];

  for (const [path, init] of legacyRequests) {
    const response = await fetch(`${baseUrl}${path}`, init);
    assert.equal(response.status, 404, `${init?.method ?? 'GET'} ${path}`);
  }
});

test('trainer creation trims input, generates an ID, validates body and maps duplicate email', async () => {
  const input = {
    name: '  Misty  ',
    age: 16,
    city: '  Cerulean  ',
    email: '  misty-http@example.test  ',
  };
  const created = await request('/api/v1/trainers', json('POST', input));
  assert.equal(created.status, 201);
  assert.match(created.body.data.id, /^[0-9a-f-]{36}$/);
  assert.equal(created.body.data.name, 'Misty');
  assert.equal(created.body.data.city, 'Cerulean');
  assert.equal(created.body.data.email, 'misty-http@example.test');

  const duplicate = await request('/api/v1/trainers', json('POST', input));
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.message, 'E-mail de Treinador já cadastrado.');
  assert.deepEqual(duplicate.body.details, []);

  const invalid = await request(
    '/api/v1/trainers',
    json('POST', { ...input, id: randomUUID(), age: 0 }),
  );
  assert.equal(invalid.status, 400);
});

test('capture and team routes enforce UUIDs, ownership, capacity and trainer existence', async () => {
  const trainer = trainers.trainers[0];
  const capture = await request(
    `/api/v1/trainers/${trainer.id}/captures`,
    json('POST', { name: '  pikachu  ' }),
  );
  assert.equal(capture.status, 201);
  assert.equal(capture.body.data.trainerId, trainer.id);
  assert.equal(capture.body.data.active, true);
  assert.deepEqual(capture.body.data.stats, pikachu.stats);
  assert.equal(gateway.receivedNames.at(-1), 'pikachu');

  const team = await request(`/api/v1/trainers/${trainer.id}/team`);
  assert.equal(team.status, 200);
  assert.equal(team.body.data.length, 1);

  assert.equal(
    (
      await request(
        `/api/v1/trainers/${randomUUID()}/captures`,
        json('POST', { name: 'pikachu' }),
      )
    ).status,
    404,
  );
  assert.equal(
    (await request(`/api/v1/trainers/${randomUUID()}/team`)).status,
    404,
  );
  assert.equal(
    (
      await request(
        '/api/v1/trainers/not-a-uuid/captures',
        json('POST', { name: 'pikachu' }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        `/api/v1/trainers/${trainer.id}/captures`,
        json('POST', { name: 'pikachu', active: false }),
      )
    ).status,
    400,
  );

  gateway.mode = 'missing';
  assert.equal(
    (
      await request(
        `/api/v1/trainers/${trainer.id}/captures`,
        json('POST', { name: 'missingno' }),
      )
    ).status,
    404,
  );
  gateway.mode = 'unavailable';
  assert.equal(
    (
      await request(
        `/api/v1/trainers/${trainer.id}/captures`,
        json('POST', { name: 'pikachu' }),
      )
    ).status,
    503,
  );
  gateway.mode = 'found';

  while (
    captures.captures.filter(
      (item) => item.trainerId === trainer.id && item.active,
    ).length < 6
  ) {
    await captures.createIfCapacity({ trainerId: trainer.id, ...pikachu });
  }
  assert.equal(
    (
      await request(
        `/api/v1/trainers/${trainer.id}/captures`,
        json('POST', { name: 'pikachu' }),
      )
    ).status,
    409,
  );
});

test('release is idempotent and hides captures owned by another trainer', async () => {
  const owner = trainers.trainers[0];
  const capture = captures.captures.find(
    (item) => item.trainerId === owner.id,
  )!;
  const path = `/api/v1/trainers/${owner.id}/captures/${capture.id}/release`;

  const released = await request(path, { method: 'PATCH' });
  assert.equal(released.status, 200);
  assert.equal(released.body.data.active, false);
  assert.deepEqual(released.body.data.stats, pikachu.stats);

  const repeated = await request(path, json('PATCH', {}));
  assert.equal(repeated.status, 200);
  assert.equal(repeated.body.data.active, false);

  const otherTrainer = await trainers.create({
    name: 'Brock',
    age: 17,
    city: 'Pewter',
    email: 'brock-http@example.test',
  });
  const emptyTeam = await request(`/api/v1/trainers/${otherTrainer.id}/team`);
  assert.equal(emptyTeam.status, 200);
  assert.deepEqual(emptyTeam.body.data, []);
  assert.equal(
    (
      await request(
        `/api/v1/trainers/${otherTrainer.id}/captures/${capture.id}/release`,
        json('PATCH', {}),
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await request(
        `/api/v1/trainers/${owner.id}/captures/${randomUUID()}/release`,
        json('PATCH', {}),
      )
    ).status,
    404,
  );
  assert.equal(
    (await request(path, json('PATCH', { active: true }))).status,
    400,
  );
});
