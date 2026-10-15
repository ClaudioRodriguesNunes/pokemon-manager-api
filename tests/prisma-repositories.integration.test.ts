import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { Prisma } from '@prisma/client';
import { CapturePokemonUseCase } from '../src/application/use-cases/capture-pokemon.js';
import { GetActiveTeamUseCase } from '../src/application/use-cases/get-active-team.js';
import { ReleasePokemonCaptureUseCase } from '../src/application/use-cases/release-pokemon-capture.js';
import { ActiveCaptureLimitError } from '../src/domain/errors/active-capture-limit-error.js';
import { CaptureNotFoundError } from '../src/domain/errors/capture-not-found-error.js';
import { TrainerNotFoundError } from '../src/domain/errors/trainer-not-found-error.js';
import {
  IPokeApiGateway,
  PokeApiPokemonData,
} from '../src/domain/gateways/poke-api-gateway.js';
import { prisma } from '../src/infrastructure/database/prisma/prisma-client.js';
import { PrismaPokemonCaptureRepository } from '../src/infrastructure/database/prisma/prisma-pokemon-capture-repository.js';
import { PrismaTrainerRepository } from '../src/infrastructure/database/prisma/prisma-trainer-repository.js';

const integrationTest = process.env.RUN_DB_TESTS === '1' ? test : test.skip;

const pokemon: PokeApiPokemonData = {
  pokeApiId: 121,
  name: 'starmie',
  types: ['water', 'psychic'],
  stats: {
    hp: 60,
    attack: 75,
    defense: 85,
    specialAttack: 100,
    specialDefense: 85,
    speed: 115,
  },
  spriteUrl: 'https://example.test/starmie.png',
  baseExperience: 182,
  height: 11,
  weight: 800,
};

class StubPokeApiGateway implements IPokeApiGateway {
  async findByName(_name: string): Promise<PokeApiPokemonData> {
    return pokemon;
  }
}

integrationTest(
  'persists trainers and snapshots while enforcing six active captures atomically',
  async () => {
    const runId = randomUUID();
    const trainerIds: string[] = [];
    const trainers = new PrismaTrainerRepository();
    const captures = new PrismaPokemonCaptureRepository();
    const capturePokemon = new CapturePokemonUseCase(
      trainers,
      captures,
      new StubPokeApiGateway(),
    );

    try {
      await assert.rejects(
        () =>
          captures.createIfCapacity({
            trainerId: randomUUID(),
            ...pokemon,
          }),
        TrainerNotFoundError,
      );

      const trainer = await trainers.create({
        name: `Prompt 4 ${runId}`,
        age: 18,
        city: 'Saffron',
        email: `prompt4-${runId}@example.test`,
      });
      trainerIds.push(trainer.id);

      assert.deepEqual((await trainers.findById(trainer.id))?.toJSON(), {
        id: trainer.id,
        name: `Prompt 4 ${runId}`,
        age: 18,
        city: 'Saffron',
        email: `prompt4-${runId}@example.test`,
      });

      await assert.rejects(
        () =>
          trainers.create({
            name: 'Duplicate email',
            age: 19,
            city: 'Celadon',
            email: trainer.email,
          }),
        (error: unknown) =>
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002',
      );

      const first = await capturePokemon.execute({
        trainerId: trainer.id,
        pokemonName: pokemon.name,
      });
      assert.deepEqual((await captures.findById(first.id))?.toJSON(), {
        id: first.id,
        trainerId: trainer.id,
        active: true,
        ...pokemon,
      });

      for (let index = 0; index < 4; index += 1) {
        await capturePokemon.execute({
          trainerId: trainer.id,
          pokemonName: pokemon.name,
        });
      }

      const concurrent = await Promise.allSettled([
        capturePokemon.execute({
          trainerId: trainer.id,
          pokemonName: pokemon.name,
        }),
        capturePokemon.execute({
          trainerId: trainer.id,
          pokemonName: pokemon.name,
        }),
      ]);
      assert.equal(
        concurrent.filter((result) => result.status === 'fulfilled').length,
        1,
      );
      const rejected = concurrent.find(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected',
      );
      assert.ok(rejected?.reason instanceof ActiveCaptureLimitError);
      assert.equal(
        await prisma.pokemonCapture.count({
          where: { trainerId: trainer.id, active: true },
        }),
        6,
      );

      await assert.rejects(
        () =>
          capturePokemon.execute({
            trainerId: trainer.id,
            pokemonName: pokemon.name,
          }),
        ActiveCaptureLimitError,
      );

      const team = await new GetActiveTeamUseCase(trainers, captures).execute(
        trainer.id,
      );
      assert.equal(team.length, 6);
      assert.ok(team.every((capture) => capture.active));

      const release = new ReleasePokemonCaptureUseCase(captures);
      const released = await release.execute({
        trainerId: trainer.id,
        captureId: first.id,
      });
      assert.equal(released.active, false);
      assert.equal((await captures.findById(first.id))?.active, false);

      const releasedAgain = await release.execute({
        trainerId: trainer.id,
        captureId: first.id,
      });
      assert.equal(releasedAgain.active, false);

      const otherTrainer = await trainers.create({
        name: `Prompt 4 other ${runId}`,
        age: 20,
        city: 'Pewter',
        email: `prompt4-other-${runId}@example.test`,
      });
      trainerIds.push(otherTrainer.id);

      const nullableSnapshot = await captures.createIfCapacity({
        trainerId: otherTrainer.id,
        ...pokemon,
        types: ['psychic', 'water'],
        spriteUrl: null,
        baseExperience: null,
        height: null,
        weight: null,
      });
      assert.deepEqual(
        (await captures.findById(nullableSnapshot.id))?.toJSON(),
        {
          ...nullableSnapshot.toJSON(),
          types: ['psychic', 'water'],
          spriteUrl: null,
          baseExperience: null,
          height: null,
          weight: null,
        },
      );

      await assert.rejects(
        () =>
          release.execute({
            trainerId: otherTrainer.id,
            captureId: team[1].id,
          }),
        CaptureNotFoundError,
      );

      const replacement = await capturePokemon.execute({
        trainerId: trainer.id,
        pokemonName: pokemon.name,
      });
      assert.equal(replacement.active, true);
      assert.equal(
        await prisma.pokemonCapture.count({
          where: { trainerId: trainer.id, active: true },
        }),
        6,
      );
    } finally {
      if (trainerIds.length > 0) {
        await prisma.pokemonCapture.deleteMany({
          where: { trainerId: { in: trainerIds } },
        });
        await prisma.trainer.deleteMany({ where: { id: { in: trainerIds } } });
      }
      await prisma.$disconnect();
    }
  },
);
