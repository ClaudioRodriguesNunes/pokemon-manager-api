import express from 'express';

import { pokemonRoutes } from '../infrastructure/http/routes/pokemon-routes.js';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });

  next();
});

app.use('/api/v1/pokemons', pokemonRoutes);

const PORT = 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
