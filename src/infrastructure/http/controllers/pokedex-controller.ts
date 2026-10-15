import { Request, Response } from 'express';
import { FindPokemonByNameUseCase } from '../../../application/use-cases/find-pokemon-by-name.js';

export class PokedexController {
  constructor(private findPokemonByNameUseCase: FindPokemonByNameUseCase) {}

  async search(_req: Request, res: Response): Promise<Response> {
    const { name } = res.locals.validated.query as { name: string };
    const pokemon = await this.findPokemonByNameUseCase.execute(name);
    return res.status(200).json({ success: true, data: pokemon });
  }
}
