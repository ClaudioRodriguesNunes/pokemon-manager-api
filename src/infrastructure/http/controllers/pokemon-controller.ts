import { Request, Response } from 'express';
import {
  CreatePokemonDTO,
  UpdatePokemonDTO,
} from '../../../application/dtos/pokemon-dto.js';
import { CreatePokemonUseCase } from '../../../application/use-cases/create-pokemon.js';
import { DeletePokemonUseCase } from '../../../application/use-cases/delete-pokemon.js';
import { GetPokemonByIdUseCase } from '../../../application/use-cases/get-pokemon-by-id.js';
import { GetPokemonStatsUseCase } from '../../../application/use-cases/get-pokemon-stats.js';
import { ListPokemonsUseCase } from '../../../application/use-cases/list-pokemons.js';
import { UpdatePokemonUseCase } from '../../../application/use-cases/update-pokemon.js';
import { ResourceNotFoundError } from '../../../domain/errors/resource-not-found-error.js';

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

  async create(
    req: Request<Record<string, never>, unknown, CreatePokemonDTO>,
    res: Response,
  ): Promise<Response> {
    try {
      this.validateCreateBody(req.body);

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

  async update(
    req: Request<{ id: string }, unknown, UpdatePokemonDTO>,
    res: Response,
  ): Promise<Response> {
    const { id } = req.params;

    try {
      this.validateUpdateBody(req.body);

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

  private validateCreateBody(body: CreatePokemonDTO): void {
    if (typeof body !== 'object' || body === null) {
      throw new Error('Corpo da requisição inválido.');
    }

    if (typeof body.id !== 'string' || body.id.trim() === '') {
      throw new Error('ID deve ser uma string não vazia.');
    }

    this.validateCommonBody(body);
  }

  private validateUpdateBody(body: UpdatePokemonDTO): void {
    if (typeof body !== 'object' || body === null) {
      throw new Error('Corpo da requisição inválido.');
    }

    this.validateCommonBody(body);
  }

  private validateCommonBody(body: UpdatePokemonDTO): void {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      throw new Error('Nome deve ser uma string não vazia.');
    }

    if (typeof body.type !== 'string') {
      throw new Error('Tipo deve ser uma string.');
    }

    if (typeof body.hp !== 'number') {
      throw new Error('HP deve ser um número.');
    }

    if (typeof body.attack !== 'number') {
      throw new Error('Ataque deve ser um número.');
    }

    if (typeof body.defense !== 'number') {
      throw new Error('Defesa deve ser um número.');
    }
  }
}
