import express, { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import { CreateTrainerDTO } from '../application/dtos/trainer-dto.js';

import { IPokemon } from '../domain/entities/pokemon.js';

import { MockPokemonRepository } from '../infrastructure/database/in-memory/mock-pokemon-repository.js';

const app = express();

const pokemonRepository = new MockPokemonRepository();

app.use(express.json());

app.post(
  '/api/v1/trainers',
  (
    req: Request<ParamsDictionary, unknown, CreateTrainerDTO>,
    res: Response,
  ) => {
    const { name, age, city } = req.body;

    if (typeof age !== 'number' || age <= 0) {
      return res.status(400).json({
        message: 'A idade deve ser um número positivo.',
      });
    }

    return res.status(201).json({
      message: 'Treinador cadastrado com sucesso!',
      data: {
        name,
        age,
        city,
      },
    });
  },
);

app.get('/api/v1/pokemons', async (_req: Request, res: Response) => {
  const pokemons = await pokemonRepository.findAll();

  return res.status(200).json(pokemons);
});

app.post(
  '/api/v1/pokemons',
  async (req: Request<ParamsDictionary, unknown, IPokemon>, res: Response) => {
    const pokemon: IPokemon = req.body;

    await pokemonRepository.save(pokemon);

    return res.status(201).json(pokemon);
  },
);

app.put(
  '/api/v1/pokemons/:id',
  async (req: Request<{ id: string }, unknown, IPokemon>, res: Response) => {
    const { id } = req.params;

    const existingPokemon = await pokemonRepository.findById(id);

    if (!existingPokemon) {
      return res.status(404).json({
        message: 'Pokémon não encontrado.',
      });
    }

    const updatedPokemon: IPokemon = {
      ...req.body,
      id,
    };

    await pokemonRepository.update(id, updatedPokemon);

    return res.status(200).json(updatedPokemon);
  },
);

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
