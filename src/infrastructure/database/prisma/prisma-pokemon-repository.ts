import { randomUUID } from 'node:crypto';
import { Pokemon } from '../../../domain/entities/pokemon.js';
import { CreatePokemonProps } from '../../../domain/entities/pokemon.js';
import { IPokemonRepository } from '../../../domain/repositories/pokemon-repository.js';
import { prisma } from './prisma-client.js';

export class PrismaPokemonRepository implements IPokemonRepository {
  async findAll(): Promise<Pokemon[]> {
    const records = await prisma.pokemon.findMany();

    return records.map((record) => this.toDomain(record));
  }

  async findByType(type: string): Promise<Pokemon[]> {
    const records = await prisma.pokemon.findMany({
      where: {
        type: {
          equals: type,
          mode: 'insensitive',
        },
      },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Pokemon | null> {
    const record = await prisma.pokemon.findUnique({
      where: { id },
    });

    return record ? this.toDomain(record) : null;
  }

  async create(input: CreatePokemonProps): Promise<Pokemon> {
    const pokemon = new Pokemon({
      id: randomUUID(),
      ...input,
    });

    const record = await prisma.pokemon.create({
      data: pokemon.toJSON(),
    });

    return this.toDomain(record);
  }

  async update(pokemon: Pokemon): Promise<void> {
    await prisma.pokemon.update({
      where: { id: pokemon.id },
      data: pokemon.toJSON(),
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.pokemon.delete({
      where: { id },
    });
  }

  private toDomain(record: {
    id: string;
    name: string;
    type: string;
    hp: number;
    attack: number;
    defense: number;
  }): Pokemon {
    return new Pokemon({
      id: record.id,
      name: record.name,
      type: record.type as Pokemon['type'],
      hp: record.hp,
      attack: record.attack,
      defense: record.defense,
    });
  }
}
