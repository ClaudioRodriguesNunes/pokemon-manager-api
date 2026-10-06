import { Request, Response } from 'express';
import { CreatePokemonUseCase } from '../../../application/use-cases/create-pokemon.js';
import { DeletePokemonUseCase } from '../../../application/use-cases/delete-pokemon.js';
import { GetPokemonByIdUseCase } from '../../../application/use-cases/get-pokemon-by-id.js';
import { GetPokemonStatsUseCase } from '../../../application/use-cases/get-pokemon-stats.js';
import { ListPokemonsUseCase } from '../../../application/use-cases/list-pokemons.js';
import { UpdatePokemonUseCase } from '../../../application/use-cases/update-pokemon.js';

export class PokemonController {
  constructor(
    private listPokemonsUseCase: ListPokemonsUseCase,
    private getPokemonByIdUseCase: GetPokemonByIdUseCase,
    private createPokemonUseCase: CreatePokemonUseCase,
    private updatePokemonUseCase: UpdatePokemonUseCase,
    private deletePokemonUseCase: DeletePokemonUseCase,
    private getPokemonStatsUseCase: GetPokemonStatsUseCase,
  ) {}

  async list(req: Request, res: Response): Promise<Response> {
    const type = req.query.type;

    const pokemons = await this.listPokemonsUseCase.execute({
      type: typeof type === 'string' ? type : undefined,
    });

    return res.status(200).json(pokemons);
  }

  async stats(_req: Request, res: Response): Promise<Response> {
    const stats = await this.getPokemonStatsUseCase.execute();

    return res.status(200).json(stats);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params as { id: string };

    const pokemon = await this.getPokemonByIdUseCase.execute(id);
    return res.status(200).json(pokemon);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const pokemon = await this.createPokemonUseCase.execute(req.body);
    return res.status(201).json({
      success: true,
      data: pokemon,
    });
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params as { id: string };

    const pokemon = await this.updatePokemonUseCase.execute({
      id,
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      data: pokemon,
    });
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params as { id: string };

    await this.deletePokemonUseCase.execute(id);

    return res.status(204).send();
  }
}
