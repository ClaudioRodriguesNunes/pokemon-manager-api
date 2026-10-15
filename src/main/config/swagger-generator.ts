import path from 'path';
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '2.0.0',
    title: 'PokéManager API',
    description:
      'Entrega 2 atualizada: Pokédex via PokéAPI, Treinadores, Capturas, time ativo e liberação.',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Servidor local da PokéManager API',
    },
  ],
  tags: [
    { name: 'Pokédex', description: 'Consulta direta à PokéAPI oficial' },
    {
      name: 'Treinadores',
      description: 'Cadastro, Capturas, time ativo e liberação',
    },
  ],
  definitions: {
    PokemonSnapshot: {
      pokeApiId: 25,
      name: 'pikachu',
      types: ['electric'],
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
      },
      spriteUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      baseExperience: 112,
      height: 4,
      weight: 60,
    },
    Capture: {
      id: '123e4567-e89b-42d3-a456-426614174001',
      trainerId: '123e4567-e89b-42d3-a456-426614174000',
      active: true,
      pokeApiId: 25,
      name: 'pikachu',
      types: ['electric'],
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
      },
      spriteUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      baseExperience: 112,
      height: 4,
      weight: 60,
    },
    Trainer: {
      id: '123e4567-e89b-42d3-a456-426614174000',
      name: 'Misty',
      age: 16,
      city: 'Cerulean',
      email: 'misty@example.com',
    },
    ErrorResponse: {
      status: 'error',
      message: 'Dados de entrada inválidos.',
      details: [],
    },
  },
};

const outputFile = path.resolve(__dirname, 'swagger-output.json');
const endpointsFiles = [
  path.resolve(__dirname, '../../infrastructure/http/routes/pokedex-routes.ts'),
  path.resolve(__dirname, '../../infrastructure/http/routes/trainer-routes.ts'),
];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
