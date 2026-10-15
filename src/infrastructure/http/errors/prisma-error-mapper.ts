import { Prisma } from '@prisma/client';
import { AppError } from '../../../domain/errors/app-error.js';
import { ResourceNotFoundError } from '../../../domain/errors/resource-not-found-error.js';

export function mapPrismaError(error: unknown): AppError | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    return new ResourceNotFoundError('Pokémon não encontrado no catálogo.');
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const target = error.meta?.target;
    const fields = Array.isArray(target)
      ? target.map(String)
      : typeof target === 'string'
        ? [target]
        : [];
    if (fields.some((field) => field.toLowerCase().includes('email'))) {
      return new AppError('E-mail de Treinador já cadastrado.', 409);
    }
  }

  return null;
}

export function isPrismaError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientValidationError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  );
}
