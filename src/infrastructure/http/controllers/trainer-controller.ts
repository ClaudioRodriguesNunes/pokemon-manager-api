import { Request, Response } from 'express';
import { CapturePokemonUseCase } from '../../../application/use-cases/capture-pokemon.js';
import { CreateTrainerUseCase } from '../../../application/use-cases/create-trainer.js';
import { GetActiveTeamUseCase } from '../../../application/use-cases/get-active-team.js';
import { ReleasePokemonCaptureUseCase } from '../../../application/use-cases/release-pokemon-capture.js';
import { CreateTrainerDTO } from '../../../application/dtos/trainer-dto.js';

export class TrainerController {
  constructor(
    private createTrainerUseCase: CreateTrainerUseCase,
    private capturePokemonUseCase: CapturePokemonUseCase,
    private getActiveTeamUseCase: GetActiveTeamUseCase,
    private releasePokemonCaptureUseCase: ReleasePokemonCaptureUseCase,
  ) {}

  async create(_req: Request, res: Response): Promise<Response> {
    const input = res.locals.validated.body as CreateTrainerDTO;
    const trainer = await this.createTrainerUseCase.execute(input);
    return res.status(201).json({ success: true, data: trainer });
  }

  async capture(_req: Request, res: Response): Promise<Response> {
    const { trainerId } = res.locals.validated.params as { trainerId: string };
    const { name } = res.locals.validated.body as { name: string };
    const capture = await this.capturePokemonUseCase.execute({
      trainerId,
      pokemonName: name,
    });
    return res.status(201).json({ success: true, data: capture });
  }

  async team(_req: Request, res: Response): Promise<Response> {
    const { trainerId } = res.locals.validated.params as { trainerId: string };
    const team = await this.getActiveTeamUseCase.execute(trainerId);
    return res.status(200).json({ success: true, data: team });
  }

  async release(_req: Request, res: Response): Promise<Response> {
    const { trainerId, captureId } = res.locals.validated.params as {
      trainerId: string;
      captureId: string;
    };
    const capture = await this.releasePokemonCaptureUseCase.execute({
      trainerId,
      captureId,
    });
    return res.status(200).json({ success: true, data: capture });
  }
}
