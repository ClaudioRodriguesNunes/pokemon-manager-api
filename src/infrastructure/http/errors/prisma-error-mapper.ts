import { Prisma } from '@prisma/client';
import { ResourceNotFoundError } from '../../../domain/errors/resource-not-found-error.js';

export function mapPrismaError(error: unknown): ResourceNotFoundError | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    return new ResourceNotFoundError('Pokémon não encontrado no catálogo.');
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
