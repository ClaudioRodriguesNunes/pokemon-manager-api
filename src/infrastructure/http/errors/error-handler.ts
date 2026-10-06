import { ErrorRequestHandler } from 'express';
import { z } from 'zod';
import { AppError } from '../../../domain/errors/app-error.js';
import { isPrismaError, mapPrismaError } from './prisma-error-mapper.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Dados de entrada inválidos.',
      details: error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      details: error.details,
    });
  }

  const mappedPrismaError = mapPrismaError(error);
  if (mappedPrismaError) {
    return res.status(mappedPrismaError.statusCode).json({
      status: 'error',
      message: mappedPrismaError.message,
      details: [],
    });
  }

  if (isPrismaError(error)) {
    console.error(error);
  } else {
    console.error(error);
  }

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor.',
    details: [],
  });
};
