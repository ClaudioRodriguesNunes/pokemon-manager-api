import path from 'path';
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: 'PokéManager API',
    description:
      'API desenvolvida para a disciplina Tópicos Especiais em Engenharia de Software - UFF',
  },

  servers: [
    {
      url: 'http://localhost:3333/api/v1/pokemons',
      description: 'Servidor local da PokéManager API',
    },
  ],

  tags: [
    {
      name: 'Pokemons',
      description: 'Gerenciamento do catálogo de Pokémons',
    },
  ],

  definitions: {
    Pokemon: {
      id: '25',
      name: 'Pikachu',
      type: 'Electric',
      hp: 35,
      attack: 55,
      defense: 40,
      spriteUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      baseExperience: 112,
      height: 4,
      weight: 60,
    },

    CreatePokemonDTO: {
      $name: 'Pikachu',
      $type: 'Electric',
      $hp: 35,
      $attack: 55,
      $defense: 40,
    },

    UpdatePokemonDTO: {
      $name: 'Pikachu Fortalecido',
      $type: 'Electric',
      $hp: 50,
      $attack: 65,
      $defense: 45,
    },

    ErrorResponse: {
      status: 'error',
      message: 'Pokémon não encontrado no catálogo.',
      details: [],
    },

    PokemonStats: {
      totalPokemons: 2,
      typesCount: {
        Electric: 1,
        Fire: 1,
      },
    },
  },
};

const outputFile = path.resolve(__dirname, 'swagger-output.json');

const endpointsFiles = [
  path.resolve(__dirname, '../../infrastructure/http/routes/pokemon-routes.ts'),
];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
