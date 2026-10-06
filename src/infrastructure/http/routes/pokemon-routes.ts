import { Router } from 'express';
import { PokemonController } from '../controllers/pokemon-controller.js';
import { validateRequest } from '../validation/validate-request.js';
import {
  createPokemonSchema,
  listPokemonsQuerySchema,
  pokemonIdSchema,
  updatePokemonSchema,
} from '../validation/pokemon-schemas.js';

export function createPokemonRoutes(
  pokemonController: PokemonController,
): Router {
  const pokemonRoutes = Router();

  pokemonRoutes.get('/', validateRequest(listPokemonsQuerySchema, 'query'), (req, res) => {
    /*
      #swagger.tags = ['Pokemons']
      #swagger.summary = 'Lista os Pokémons'
      #swagger.description = 'Retorna todos os Pokémons cadastrados. Pode receber o tipo como filtro pela query string.'

      #swagger.parameters['type'] = {
        in: 'query',
        required: false,
        type: 'string',
        example: 'Fire',
        description: 'Filtra os Pokémons pelo tipo.'
      }

      #swagger.responses[200] = {
        description: 'Lista de Pokémons retornada com sucesso.',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: { $ref: '#/components/schemas/Pokemon' }
            }
          }
        }
      }
    */
    return pokemonController.list(req, res);
  });

  pokemonRoutes.get('/stats', (req, res) => {
    /*
      #swagger.tags = ['Pokemons']
      #swagger.summary = 'Consulta estatísticas do catálogo'
      #swagger.description = 'Retorna a quantidade total de Pokémons e a distribuição dos registros por tipo.'

      #swagger.responses[200] = {
        description: 'Estatísticas retornadas com sucesso.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PokemonStats' }
          }
        }
      }
    */
    return pokemonController.stats(req, res);
  });

  pokemonRoutes.get('/:id', validateRequest(pokemonIdSchema, 'params'), (req, res) => {
    /*
      #swagger.tags = ['Pokemons']
      #swagger.summary = 'Busca um Pokémon por ID'
      #swagger.description = 'Retorna o Pokémon correspondente ao identificador informado.'

      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        example: '25',
        description: 'Identificador do Pokémon.'
      }

      #swagger.responses[200] = {
        description: 'Pokémon encontrado.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Pokemon' }
          }
        }
      }

      #swagger.responses[404] = {
        description: 'Pokémon não encontrado.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }

      #swagger.responses[500] = {
        description: 'Erro interno do servidor.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    */
    return pokemonController.getById(req, res);
  });

  pokemonRoutes.post('/', validateRequest(createPokemonSchema, 'body'), (req, res) => {
    /*
      #swagger.tags = ['Pokemons']
      #swagger.summary = 'Cadastra um Pokémon'
      #swagger.description = 'Cria um novo Pokémon no catálogo.'

      #swagger.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePokemonDTO' }
          }
        }
      }

      #swagger.responses[201] = {
        description: 'Pokémon cadastrado com sucesso.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: true
                },
                data: {
                  $ref: '#/components/schemas/Pokemon'
                }
              }
            }
          }
        }
      }

      #swagger.responses[400] = {
        description: 'Dados inválidos ou Pokémon já cadastrado.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }

      #swagger.responses[500] = {
        description: 'Erro interno do servidor.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    */
    return pokemonController.create(req, res);
  });

  pokemonRoutes.put(
    '/:id',
    validateRequest(pokemonIdSchema, 'params'),
    validateRequest(updatePokemonSchema, 'body'),
    (req, res) => {
    /*
      #swagger.tags = ['Pokemons']
      #swagger.summary = 'Atualiza um Pokémon'
      #swagger.description = 'Atualiza os dados do Pokémon identificado pelo ID informado.'

      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        example: '25',
        description: 'Identificador do Pokémon.'
      }

      #swagger.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdatePokemonDTO' }
          }
        }
      }

      #swagger.responses[200] = {
        description: 'Pokémon atualizado com sucesso.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: true
                },
                data: {
                  $ref: '#/components/schemas/Pokemon'
                }
              }
            }
          }
        }
      }

      #swagger.responses[400] = {
        description: 'Dados inválidos.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }

      #swagger.responses[404] = {
        description: 'Pokémon não encontrado.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }

      #swagger.responses[500] = {
        description: 'Erro interno do servidor.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    */
      return pokemonController.update(req, res);
    },
  );

  pokemonRoutes.delete(
    '/:id',
    validateRequest(pokemonIdSchema, 'params'),
    (req, res) => {
    /*
      #swagger.tags = ['Pokemons']
      #swagger.summary = 'Exclui um Pokémon'
      #swagger.description = 'Remove do catálogo o Pokémon identificado pelo ID informado.'

      #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        example: '25',
        description: 'Identificador do Pokémon.'
      }

      #swagger.responses[204] = {
        description: 'Pokémon excluído com sucesso.'
      }

      #swagger.responses[404] = {
        description: 'Pokémon não encontrado.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }

      #swagger.responses[500] = {
        description: 'Erro interno do servidor.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    */
      return pokemonController.delete(req, res);
    },
  );

  return pokemonRoutes;
}
