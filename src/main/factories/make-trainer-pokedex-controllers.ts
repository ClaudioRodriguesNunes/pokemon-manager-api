import { CapturePokemonUseCase } from '../../application/use-cases/capture-pokemon.js';
import { CreateTrainerUseCase } from '../../application/use-cases/create-trainer.js';
import { FindPokemonByNameUseCase } from '../../application/use-cases/find-pokemon-by-name.js';
import { GetTrainerCaptureHistoryUseCase } from '../../application/use-cases/get-trainer-capture-history.js';
import { GetActiveTeamUseCase } from '../../application/use-cases/get-active-team.js';
import { ListTrainersUseCase } from '../../application/use-cases/list-trainers.js';
import { ReleasePokemonCaptureUseCase } from '../../application/use-cases/release-pokemon-capture.js';
import { SearchTrainersByNameUseCase } from '../../application/use-cases/search-trainers-by-name.js';
import { PrismaPokemonCaptureRepository } from '../../infrastructure/database/prisma/prisma-pokemon-capture-repository.js';
import { PrismaTrainerRepository } from '../../infrastructure/database/prisma/prisma-trainer-repository.js';
import { PokedexController } from '../../infrastructure/http/controllers/pokedex-controller.js';
import { TrainerController } from '../../infrastructure/http/controllers/trainer-controller.js';
import { PokeApiProvider } from '../../infrastructure/providers/poke-api-provider.js';

export function makeTrainerPokedexControllers(): {
  pokedexController: PokedexController;
  trainerController: TrainerController;
} {
  const trainerRepository = new PrismaTrainerRepository();
  const captureRepository = new PrismaPokemonCaptureRepository();
  const pokeApiGateway = new PokeApiProvider();

  return {
    pokedexController: new PokedexController(
      new FindPokemonByNameUseCase(pokeApiGateway),
    ),
    trainerController: new TrainerController(
      new CreateTrainerUseCase(trainerRepository),
      new ListTrainersUseCase(trainerRepository),
      new SearchTrainersByNameUseCase(trainerRepository),
      new CapturePokemonUseCase(
        trainerRepository,
        captureRepository,
        pokeApiGateway,
      ),
      new GetActiveTeamUseCase(trainerRepository, captureRepository),
      new GetTrainerCaptureHistoryUseCase(trainerRepository, captureRepository),
      new ReleasePokemonCaptureUseCase(captureRepository, trainerRepository),
    ),
  };
}
