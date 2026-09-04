import { ListPokemonsUseCase } from '../../application/use-cases/list-pokemons.js';
import { InMemoryPokemonRepository } from '../../infrastructure/database/in-memory/in-memory-pokemon-repository.js';
import { PokemonController } from '../../infrastructure/http/controllers/pokemon-controller.js';
import { GetPokemonByIdUseCase } from '../../application/use-cases/get-pokemon-by-id.js';
import { CreatePokemonUseCase } from '../../application/use-cases/create-pokemon.js';
import { UpdatePokemonUseCase } from '../../application/use-cases/update-pokemon.js';
import { DeletePokemonUseCase } from '../../application/use-cases/delete-pokemon.js';

const pokemonRepository = new InMemoryPokemonRepository();

export function makePokemonController(): PokemonController {
  const listPokemonsUseCase = new ListPokemonsUseCase(pokemonRepository);

  const getPokemonByIdUseCase = new GetPokemonByIdUseCase(pokemonRepository);

  const createPokemonUseCase = new CreatePokemonUseCase(pokemonRepository);

  const updatePokemonUseCase = new UpdatePokemonUseCase(pokemonRepository);

  const deletePokemonUseCase = new DeletePokemonUseCase(pokemonRepository);

  return new PokemonController(
    listPokemonsUseCase,
    getPokemonByIdUseCase,
    createPokemonUseCase,
    updatePokemonUseCase,
    deletePokemonUseCase,
  );
}
