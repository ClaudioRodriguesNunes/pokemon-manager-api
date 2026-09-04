import { Request, Response } from 'express';
import { ListPokemonsUseCase } from '../../../application/use-cases/list-pokemons.js';
import { GetPokemonByIdUseCase } from '../../../application/use-cases/get-pokemon-by-id.js';
import { ResourceNotFoundError } from '../../../domain/errors/resource-not-found-error.js';
import { CreatePokemonUseCase } from '../../../application/use-cases/create-pokemon.js';
import { UpdatePokemonUseCase } from '../../../application/use-cases/update-pokemon.js';
import { DeletePokemonUseCase } from '../../../application/use-cases/delete-pokemon.js';

export class PokemonController {
  constructor(
    private listPokemonsUseCase: ListPokemonsUseCase,
    private getPokemonByIdUseCase: GetPokemonByIdUseCase,
    private createPokemonUseCase: CreatePokemonUseCase,
    private updatePokemonUseCase: UpdatePokemonUseCase,
    private deletePokemonUseCase: DeletePokemonUseCase,
  ) {}

  async list(req: Request, res: Response): Promise<Response> {
    const type = req.query.type;

    const pokemons = await this.listPokemonsUseCase.execute({
      type: typeof type === 'string' ? type : undefined,
    });

    return res.status(200).json(pokemons);
  }

  async getById(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;

    try {
      const pokemon = await this.getPokemonByIdUseCase.execute(id);
      return res.status(200).json(pokemon);
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return res.status(404).json({
          message: error.message,
        });
      }
      return res.status(500).json({
        message: 'Erro interno do servidor.',
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const pokemon = await this.createPokemonUseCase.execute(req.body);
      return res.status(201).json({
        success: true,
        data: pokemon,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }
      return res.status(500).json({
        message: 'Erro interno do servidor.',
      });
    }
  }

  async update(req: Request<{ id: string }>, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const pokemon = await this.updatePokemonUseCase.execute({
        id,
        ...req.body,
      });

      return res.status(200).json({
        success: true,
        data: pokemon,
      });
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor.',
      });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      await this.deletePokemonUseCase.execute(id);

      return res.status(204).send();
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        return res.status(404).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: 'Erro interno do servidor.',
      });
    }
  }
}
