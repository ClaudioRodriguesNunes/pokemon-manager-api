import express from 'express';

import { createPokemonRoutes } from '../infrastructure/http/routes/pokemon-routes.js';
import { makePokemonController } from './factories/make-pokemon-controller.js';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });

  next();
});

const pokemonController = makePokemonController();
const pokemonRoutes = createPokemonRoutes(pokemonController);

app.use('/api/v1/pokemons', pokemonRoutes);

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
