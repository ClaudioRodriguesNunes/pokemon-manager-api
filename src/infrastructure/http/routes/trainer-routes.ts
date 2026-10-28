import { Router } from 'express';
import { TrainerController } from '../controllers/trainer-controller.js';
import {
  capturePokemonSchema,
  createTrainerSchema,
  emptyBodySchema,
  releaseCaptureByNameParamsSchema,
  trainerNameParamsSchema,
  trainerSearchQuerySchema,
} from '../validation/trainer-pokedex-schemas.js';
import { validateRequest } from '../validation/validate-request.js';

export function createTrainerRoutes(controller: TrainerController): Router {
  const routes = Router();

  routes.get('/', (req, res) => {
    /* #swagger.path = '/api/v1/trainers'
       #swagger.tags = ['Treinadores']
       #swagger.summary = 'Listar Treinadores'
       #swagger.description = 'Lista todos os Treinadores em ordem estável por nome e UUID.'
       #swagger.responses[200] = { description: 'Treinadores encontrados', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Trainer' } } } } } } }
       #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
    */
    return controller.list(req, res);
  });

  routes.get(
    '/search',
    validateRequest(trainerSearchQuerySchema, 'query'),
    (req, res) => {
      /* #swagger.path = '/api/v1/trainers/search'
         #swagger.tags = ['Treinadores']
         #swagger.summary = 'Pesquisar Treinadores por nome'
         #swagger.description = 'Pesquisa por trecho do nome, ignorando maiúsculas/minúsculas e espaços externos. Homônimos são retornados juntos.'
         #swagger.parameters['name'] = { in: 'query', required: true, type: 'string', example: 'misty', description: 'Nome ou trecho do nome do Treinador' }
         #swagger.responses[200] = { description: 'Treinadores encontrados; lista vazia quando não houver correspondência', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Trainer' } } } } } } }
         #swagger.responses[400] = { description: 'Query inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.search(req, res);
    },
  );

  routes.post('/', validateRequest(createTrainerSchema, 'body'), (req, res) => {
    /* #swagger.path = '/api/v1/trainers'
       #swagger.tags = ['Treinadores']
       #swagger.summary = 'Cadastrar Treinador'
       #swagger.requestBody = { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'age', 'city', 'email'], additionalProperties: false, properties: { name: { type: 'string', example: 'Claudio' }, age: { type: 'integer', example: 25, minimum: 1 }, city: { type: 'string', example: 'São Paulo' }, email: { type: 'string', format: 'email', example: 'claudio@example.com' } } } } } }
       #swagger.responses[201] = { description: 'Treinador persistido com UUID', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Trainer' } } } } } }
       #swagger.responses[400] = { description: 'Body inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
       #swagger.responses[409] = { description: 'Nome ou e-mail já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
       #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
    */
    return controller.create(req, res);
  });

  routes.post(
    '/by-name/:trainerName/captures',
    validateRequest(trainerNameParamsSchema, 'params'),
    validateRequest(capturePokemonSchema, 'body'),
    (req, res) => {
      /* #swagger.path = '/api/v1/trainers/by-name/{trainerName}/captures'
         #swagger.tags = ['Treinadores']
         #swagger.summary = 'Capturar Pokémon pelo nome do Treinador'
         #swagger.description = 'Os nomes do Treinador e do Pokémon são aparados e comparados sem diferenciar maiúsculas/minúsculas. O snapshot completo da PokéAPI é persistido. Um Treinador pode ter no máximo seis Capturas ativas e não pode capturar o mesmo Pokémon duas vezes, mesmo após liberação.'
         #swagger.parameters['trainerName'] = { in: 'path', required: true, type: 'string', example: 'Claudio', description: 'Nome normalizado do Treinador; espaços podem ser codificados na URL' }
         #swagger.requestBody = { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], additionalProperties: false, properties: { name: { type: 'string', example: 'pikachu' } } } } } }
         #swagger.responses[201] = { description: 'Snapshot ativo persistido', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Capture' } } } } } }
         #swagger.responses[400] = { description: 'Nome ou body inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[404] = { description: 'Treinador ou Pokémon não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[409] = { description: 'Nome duplicado, Pokémon já capturado ou limite de seis Capturas ativas atingido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[503] = { description: 'PokéAPI indisponível, timeout ou resposta inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.capture(req, res);
    },
  );

  routes.get(
    '/by-name/:trainerName/captures',
    validateRequest(trainerNameParamsSchema, 'params'),
    (req, res) => {
      /* #swagger.path = '/api/v1/trainers/by-name/{trainerName}/captures'
         #swagger.tags = ['Treinadores']
         #swagger.summary = 'Consultar histórico por nome'
         #swagger.description = 'Retorna todas as Capturas do Treinador, incluindo as liberadas (active=false).'
         #swagger.parameters['trainerName'] = { in: 'path', required: true, type: 'string', example: 'Claudio', description: 'Nome normalizado do Treinador' }
         #swagger.responses[200] = { description: 'Histórico completo de Capturas', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Capture' } } } } } } }
         #swagger.responses[400] = { description: 'Nome inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[404] = { description: 'Treinador não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.history(req, res);
    },
  );

  routes.get(
    '/by-name/:trainerName/team',
    validateRequest(trainerNameParamsSchema, 'params'),
    (req, res) => {
      /* #swagger.path = '/api/v1/trainers/by-name/{trainerName}/team'
         #swagger.tags = ['Treinadores']
         #swagger.summary = 'Consultar time por nome'
         #swagger.description = 'Retorna somente Capturas ativas; Capturas liberadas continuam preservadas no histórico.'
         #swagger.parameters['trainerName'] = { in: 'path', required: true, type: 'string', example: 'Claudio', description: 'Nome normalizado do Treinador' }
         #swagger.responses[200] = { description: 'Time ativo', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Capture' } } } } } } }
         #swagger.responses[400] = { description: 'Nome inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[404] = { description: 'Treinador não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.team(req, res);
    },
  );

  routes.patch(
    '/by-name/:trainerName/captures/by-name/:pokemonName/release',
    validateRequest(releaseCaptureByNameParamsSchema, 'params'),
    validateRequest(emptyBodySchema, 'body'),
    (req, res) => {
      /* #swagger.path = '/api/v1/trainers/by-name/{trainerName}/captures/by-name/{pokemonName}/release'
         #swagger.tags = ['Treinadores']
         #swagger.summary = 'Liberar Captura pelo nome'
         #swagger.description = 'Marca a Captura como inativa sem exclusão física. A operação é idempotente: repeti-la devolve 200 e o mesmo snapshot inativo.'
         #swagger.parameters['trainerName'] = { in: 'path', required: true, type: 'string', example: 'Claudio', description: 'Nome normalizado do Treinador' }
         #swagger.parameters['pokemonName'] = { in: 'path', required: true, type: 'string', example: 'pikachu', description: 'Nome normalizado do Pokémon' }
         #swagger.requestBody = { required: false, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, example: {} } } } }
         #swagger.responses[200] = { description: 'Captura preservada e inativa', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Capture' } } } } } }
         #swagger.responses[400] = { description: 'Nome ou body inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[404] = { description: 'Treinador ou Captura não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.release(req, res);
    },
  );

  return routes;
}
