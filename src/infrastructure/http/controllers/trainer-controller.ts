import { Request, Response } from 'express';
import { CapturePokemonUseCase } from '../../../application/use-cases/capture-pokemon.js';
import { CreateTrainerUseCase } from '../../../application/use-cases/create-trainer.js';
import { GetTrainerCaptureHistoryUseCase } from '../../../application/use-cases/get-trainer-capture-history.js';
import { GetActiveTeamUseCase } from '../../../application/use-cases/get-active-team.js';
import { ListTrainersUseCase } from '../../../application/use-cases/list-trainers.js';
import { ReleasePokemonCaptureUseCase } from '../../../application/use-cases/release-pokemon-capture.js';
import { SearchTrainersByNameUseCase } from '../../../application/use-cases/search-trainers-by-name.js';
import { CreateTrainerDTO } from '../../../application/dtos/trainer-dto.js';

export class TrainerController {
  constructor(
    private createTrainerUseCase: CreateTrainerUseCase,
    private listTrainersUseCase: ListTrainersUseCase,
    private searchTrainersByNameUseCase: SearchTrainersByNameUseCase,
    private capturePokemonUseCase: CapturePokemonUseCase,
    private getActiveTeamUseCase: GetActiveTeamUseCase,
    private getTrainerCaptureHistoryUseCase: GetTrainerCaptureHistoryUseCase,
    private releasePokemonCaptureUseCase: ReleasePokemonCaptureUseCase,
  ) {}

  async list(_req: Request, res: Response): Promise<Response> {
    const trainers = await this.listTrainersUseCase.execute();
    return res.status(200).json({ success: true, data: trainers });
  }

  async search(_req: Request, res: Response): Promise<Response> {
    const { name } = res.locals.validated.query as { name: string };
    const trainers = await this.searchTrainersByNameUseCase.execute(name);
    return res.status(200).json({ success: true, data: trainers });
  }

  async create(_req: Request, res: Response): Promise<Response> {
    const input = res.locals.validated.body as CreateTrainerDTO;
    const trainer = await this.createTrainerUseCase.execute(input);
    return res.status(201).json({ success: true, data: trainer });
  }

  async capture(_req: Request, res: Response): Promise<Response> {
    const { trainerName } = res.locals.validated.params as {
      trainerName: string;
    };
    const { name } = res.locals.validated.body as { name: string };
    const capture = await this.capturePokemonUseCase.execute({
      trainerName,
      pokemonName: name,
    });
    return res.status(201).json({ success: true, data: capture });
  }

  async team(_req: Request, res: Response): Promise<Response> {
    const { trainerName } = res.locals.validated.params as {
      trainerName: string;
    };
    const team = await this.getActiveTeamUseCase.execute({ trainerName });
    return res.status(200).json({ success: true, data: team });
  }

  async history(_req: Request, res: Response): Promise<Response> {
    const { trainerName } = res.locals.validated.params as {
      trainerName: string;
    };
    const captures = await this.getTrainerCaptureHistoryUseCase.execute({
      trainerName,
    });
    return res.status(200).json({ success: true, data: captures });
  }

  async release(_req: Request, res: Response): Promise<Response> {
    const { trainerName, pokemonName } = res.locals.validated.params as {
      trainerName: string;
      pokemonName: string;
    };
    const capture = await this.releasePokemonCaptureUseCase.execute({
      trainerName,
      pokemonName,
    });
    return res.status(200).json({ success: true, data: capture });
  }
}
