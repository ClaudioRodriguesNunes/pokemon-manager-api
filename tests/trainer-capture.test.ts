import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CapturePokemonUseCase } from '../src/application/use-cases/capture-pokemon.js';
import { CreateTrainerUseCase } from '../src/application/use-cases/create-trainer.js';
import { FindPokemonByNameUseCase } from '../src/application/use-cases/find-pokemon-by-name.js';
import { GetTrainerCaptureHistoryUseCase } from '../src/application/use-cases/get-trainer-capture-history.js';
import { GetActiveTeamUseCase } from '../src/application/use-cases/get-active-team.js';
import { ReleasePokemonCaptureUseCase } from '../src/application/use-cases/release-pokemon-capture.js';
import {
  CreatePokemonCaptureProps,
  PokemonCapture,
} from '../src/domain/entities/pokemon-capture.js';
import { CreateTrainerProps, Trainer } from '../src/domain/entities/trainer.js';
import { ActiveCaptureLimitError } from '../src/domain/errors/active-capture-limit-error.js';
import { CaptureNotFoundError } from '../src/domain/errors/capture-not-found-error.js';
import { DuplicateCaptureError } from '../src/domain/errors/duplicate-capture-error.js';
import { ExternalGatewayError } from '../src/domain/errors/external-gateway-error.js';
import { DomainValidationError } from '../src/domain/errors/validation-error.js';
import { PokemonNotFoundError } from '../src/domain/errors/pokemon-not-found-error.js';
import {
  IPokeApiGateway,
  PokeApiPokemonData,
} from '../src/domain/gateways/poke-api-gateway.js';
import { IPokemonCaptureRepository } from '../src/domain/repositories/pokemon-capture-repository.js';
import { ITrainerRepository } from '../src/domain/repositories/trainer-repository.js';

const pikachu: PokeApiPokemonData = {
  pokeApiId: 25,
  name: 'pikachu',
  spriteUrl: 'https://example.test/pikachu.png',
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

const otherPokemon = (
  id: number,
  name = `pokemon-${id}`,
): PokeApiPokemonData => ({
  ...pikachu,
  pokeApiId: id,
  name,
});

class FakeTrainerRepository implements ITrainerRepository {
  public trainers: Trainer[] = [];

  async findAll(): Promise<Trainer[]> {
    return this.trainers;
  }

  async findById(id: string): Promise<Trainer | null> {
    return this.trainers.find((trainer) => trainer.id === id) ?? null;
  }

  async findByName(name: string): Promise<Trainer[]> {
    return this.trainers.filter((trainer) =>
      trainer.name.toLowerCase().includes(name.trim().toLowerCase()),
    );
  }

  async create(input: CreateTrainerProps): Promise<Trainer> {
    const trainer = new Trainer({
      id: `trainer-${this.trainers.length + 1}`,
      ...input,
    });
    this.trainers.push(trainer);
    return trainer;
  }
}

class FakeCaptureRepository implements IPokemonCaptureRepository {
  public captures: PokemonCapture[] = [];

  async findAllByTrainerId(trainerId: string): Promise<PokemonCapture[]> {
    return this.captures.filter((capture) => capture.trainerId === trainerId);
  }

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
    const active = this.captures.filter(
      (capture) => capture.trainerId === input.trainerId && capture.active,
    ).length;
    if (active >= 6) throw new ActiveCaptureLimitError();

    const capture = new PokemonCapture({
      id: `capture-${this.captures.length + 1}`,
      active: true,
      ...input,
    });
    this.captures.push(capture);
    return capture;
  }

  async update(_capture: PokemonCapture): Promise<void> {}
}

class FakePokeApiGateway implements IPokeApiGateway {
  constructor(private pokemon: PokeApiPokemonData | null = pikachu) {}

  async findByName(_name: string): Promise<PokeApiPokemonData | null> {
    return this.pokemon;
  }
}

async function createTrainer(
  repository: FakeTrainerRepository,
): Promise<Trainer> {
  return new CreateTrainerUseCase(repository).execute({
    name: 'Misty',
    age: 16,
    city: 'Cerulean',
    email: 'misty@example.test',
  });
}

test('creates a valid trainer and rejects invalid required fields and age', async () => {
  const repository = new FakeTrainerRepository();
  const trainer = await createTrainer(repository);

  assert.deepEqual(trainer.toJSON(), {
    id: 'trainer-1',
    name: 'Misty',
    age: 16,
    city: 'Cerulean',
    email: 'misty@example.test',
  });
  assert.throws(
    () => new Trainer({ ...trainer.toJSON(), age: 1.5 }),
    DomainValidationError,
  );
  assert.throws(
    () => new Trainer({ ...trainer.toJSON(), name: ' ' }),
    DomainValidationError,
  );
  assert.throws(
    () => new Trainer({ ...trainer.toJSON(), city: '' }),
    DomainValidationError,
  );
  assert.throws(
    () => new Trainer({ ...trainer.toJSON(), email: ' ' }),
    DomainValidationError,
  );
});

test('finds typed Pokémon data through the gateway and rejects an unknown name', async () => {
  const found = await new FindPokemonByNameUseCase(
    new FakePokeApiGateway(),
  ).execute('pikachu');
  assert.deepEqual(found, pikachu);

  await assert.rejects(
    () =>
      new FindPokemonByNameUseCase(new FakePokeApiGateway(null)).execute(
        'missingno',
      ),
    PokemonNotFoundError,
  );
});

test('captures a Pokémon as an active, independent snapshot for an existing trainer', async () => {
  const trainers = new FakeTrainerRepository();
  const captures = new FakeCaptureRepository();
  const trainer = await createTrainer(trainers);

  const capture = await new CapturePokemonUseCase(
    trainers,
    captures,
    new FakePokeApiGateway(),
  ).execute({ trainerId: trainer.id, pokemonName: 'pikachu' });

  assert.equal(capture.active, true);
  assert.equal(capture.trainerId, trainer.id);
  assert.equal(capture.pokeApiId, 25);
  assert.deepEqual(capture.stats, pikachu.stats);
  assert.equal(capture.baseExperience, 112);
});

test('does not persist a capture when the external gateway fails', async () => {
  const trainers = new FakeTrainerRepository();
  const captures = new FakeCaptureRepository();
  const trainer = await createTrainer(trainers);
  const failingGateway: IPokeApiGateway = {
    findByName: async () => {
      throw new ExternalGatewayError();
    },
  };

  await assert.rejects(
    () =>
      new CapturePokemonUseCase(trainers, captures, failingGateway).execute({
        trainerId: trainer.id,
        pokemonName: 'pikachu',
      }),
    ExternalGatewayError,
  );
  assert.equal(captures.captures.length, 0);
});

test('rejects a duplicate capture even after the previous capture is released', async () => {
  const trainers = new FakeTrainerRepository();
  const captures = new FakeCaptureRepository();
  const trainer = await createTrainer(trainers);
  const first = await captures.createIfCapacity({
    trainerId: trainer.id,
    ...pikachu,
  });

  const action = new CapturePokemonUseCase(
    trainers,
    captures,
    new FakePokeApiGateway(),
  );
  await assert.rejects(
    () => action.execute({ trainerId: trainer.id, pokemonName: 'pikachu' }),
    (error: DuplicateCaptureError) =>
      error instanceof DuplicateCaptureError && error.statusCode === 409,
  );
  first.release();
  await assert.rejects(
    () => action.execute({ trainerId: trainer.id, pokemonName: 'pikachu' }),
    DuplicateCaptureError,
  );
  assert.equal(captures.captures.length, 1);
});

test('preserves the six active capture limit for distinct Pokémon', async () => {
  const trainers = new FakeTrainerRepository();
  const captures = new FakeCaptureRepository();
  const trainer = await createTrainer(trainers);
  for (let index = 0; index < 6; index += 1) {
    await captures.createIfCapacity({
      trainerId: trainer.id,
      ...otherPokemon(index + 1),
    });
  }

  const action = new CapturePokemonUseCase(
    trainers,
    captures,
    new FakePokeApiGateway(otherPokemon(999)),
  );
  await assert.rejects(
    () => action.execute({ trainerId: trainer.id, pokemonName: 'pokemon-999' }),
    (error: ActiveCaptureLimitError) =>
      error instanceof ActiveCaptureLimitError && error.statusCode === 409,
  );
  assert.equal(captures.captures.length, 6);
});

test('returns only active captures in the trainer team', async () => {
  const trainers = new FakeTrainerRepository();
  const captures = new FakeCaptureRepository();
  const trainer = await createTrainer(trainers);
  const active = await captures.createIfCapacity({
    trainerId: trainer.id,
    ...pikachu,
  });
  const released = await captures.createIfCapacity({
    trainerId: trainer.id,
    ...otherPokemon(4, 'charmander'),
  });
  released.release();

  const team = await new GetActiveTeamUseCase(trainers, captures).execute(
    trainer.id,
  );
  assert.deepEqual(
    team.map((capture) => capture.id),
    [active.id],
  );
});

test('returns the complete capture history, including released captures', async () => {
  const trainers = new FakeTrainerRepository();
  const captures = new FakeCaptureRepository();
  const trainer = await createTrainer(trainers);
  const active = await captures.createIfCapacity({
    trainerId: trainer.id,
    ...pikachu,
  });
  const released = await captures.createIfCapacity({
    trainerId: trainer.id,
    ...otherPokemon(4, 'charmander'),
  });
  released.release();

  const history = await new GetTrainerCaptureHistoryUseCase(
    trainers,
    captures,
  ).execute(trainer.id);

  assert.deepEqual(
    history.map((capture) => [capture.id, capture.active]),
    [
      [active.id, true],
      [released.id, false],
    ],
  );
  await assert.rejects(
    () =>
      new GetTrainerCaptureHistoryUseCase(trainers, captures).execute(
        'missing-trainer',
      ),
    /Treinador não encontrado/,
  );
});

test('releases an owned capture while preserving its snapshot', async () => {
  const captures = new FakeCaptureRepository();
  const capture = await captures.createIfCapacity({
    trainerId: 'trainer-1',
    ...pikachu,
  });
  const before = capture.toJSON();

  const released = await new ReleasePokemonCaptureUseCase(captures).execute({
    trainerId: 'trainer-1',
    captureId: capture.id,
  });

  assert.equal(released.active, false);
  assert.deepEqual(released.toJSON(), { ...before, active: false });
});

test('does not allow a trainer to release another trainer capture', async () => {
  const captures = new FakeCaptureRepository();
  const capture = await captures.createIfCapacity({
    trainerId: 'trainer-1',
    ...pikachu,
  });

  await assert.rejects(
    () =>
      new ReleasePokemonCaptureUseCase(captures).execute({
        trainerId: 'trainer-2',
        captureId: capture.id,
      }),
    CaptureNotFoundError,
  );
  assert.equal(capture.active, true);
});
