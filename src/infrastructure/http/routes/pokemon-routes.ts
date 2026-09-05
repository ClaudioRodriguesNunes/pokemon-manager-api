import { Router } from 'express';
import { PokemonController } from '../controllers/pokemon-controller.js';

export function createPokemonRoutes(
  pokemonController: PokemonController,
): Router {
  const pokemonRoutes = Router();

  pokemonRoutes.get('/', (req, res) => pokemonController.list(req, res));

  pokemonRoutes.get('/stats', (req, res) => pokemonController.stats(req, res));

  pokemonRoutes.get('/:id', (req, res) => pokemonController.getById(req, res));

  pokemonRoutes.post('/', (req, res) => pokemonController.create(req, res));

  pokemonRoutes.put('/:id', (req, res) => pokemonController.update(req, res));

  pokemonRoutes.delete('/:id', (req, res) =>
    pokemonController.delete(req, res),
  );

  return pokemonRoutes;
}
