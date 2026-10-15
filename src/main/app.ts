import express, { Express } from 'express';
import { PokedexController } from '../infrastructure/http/controllers/pokedex-controller.js';
import { TrainerController } from '../infrastructure/http/controllers/trainer-controller.js';
import { errorHandler } from '../infrastructure/http/errors/error-handler.js';
import { createPokedexRoutes } from '../infrastructure/http/routes/pokedex-routes.js';
import { createTrainerRoutes } from '../infrastructure/http/routes/trainer-routes.js';
import { setupSwagger } from './config/swagger.js';
import { makeTrainerPokedexControllers } from './factories/make-trainer-pokedex-controllers.js';

export interface ApplicationDependencies {
  pokedexController: PokedexController;
  trainerController: TrainerController;
}

export interface ApplicationOptions {
  dependencies?: ApplicationDependencies;
  enableRequestLog?: boolean;
  enableSwagger?: boolean;
}

export function createApp(options: ApplicationOptions = {}): Express {
  const app = express();
  app.use(express.json());

  if (options.enableRequestLog !== false) {
    app.use((req, res, next) => {
      res.on('finish', () =>
        console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`),
      );
      next();
    });
  }

  if (options.enableSwagger !== false) setupSwagger(app);

  const dependencies = options.dependencies ?? makeTrainerPokedexControllers();
  app.use(
    '/api/v1/pokedex',
    createPokedexRoutes(dependencies.pokedexController),
  );
  app.use(
    '/api/v1/trainers',
    createTrainerRoutes(dependencies.trainerController),
  );
  app.use(errorHandler);
  return app;
}
