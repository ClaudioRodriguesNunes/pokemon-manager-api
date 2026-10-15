import { Router } from 'express';
import { PokedexController } from '../controllers/pokedex-controller.js';
import { pokedexSearchQuerySchema } from '../validation/trainer-pokedex-schemas.js';
import { validateRequest } from '../validation/validate-request.js';

export function createPokedexRoutes(controller: PokedexController): Router {
  const routes = Router();
  routes.get(
    '/search',
    validateRequest(pokedexSearchQuerySchema, 'query'),
    (req, res) => {
      /* #swagger.path = '/api/v1/pokedex/search'
         #swagger.tags = ['Pokédex']
         #swagger.summary = 'Buscar Pokémon na PokéAPI oficial'
         #swagger.description = 'Consulta por nome e devolve um DTO formatado. Requer acesso à internet; timeout ou resposta externa inválida resultam em 503.'
         #swagger.parameters['name'] = {
           in: 'query', required: true, type: 'string', example: 'pikachu',
           description: 'Nome do Pokémon'
         }
         #swagger.responses[200] = {
           description: 'Pokémon encontrado',
           content: { 'application/json': { schema: {
             type: 'object', properties: {
               success: { type: 'boolean', example: true },
               data: { $ref: '#/components/schemas/PokemonSnapshot' }
             }
           } } }
         }
         #swagger.responses[400] = { description: 'Query inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[404] = { description: 'Pokémon não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[503] = { description: 'PokéAPI indisponível, timeout ou resposta inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.search(req, res);
    },
  );
  return routes;
}
