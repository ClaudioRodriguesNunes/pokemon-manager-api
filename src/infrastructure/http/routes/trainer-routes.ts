import { Router } from 'express';
import { TrainerController } from '../controllers/trainer-controller.js';
import {
  capturePokemonSchema,
  createTrainerSchema,
  emptyBodySchema,
  releaseCaptureParamsSchema,
  trainerParamsSchema,
} from '../validation/trainer-pokedex-schemas.js';
import { validateRequest } from '../validation/validate-request.js';

export function createTrainerRoutes(controller: TrainerController): Router {
  const routes = Router();
  routes.post('/', validateRequest(createTrainerSchema, 'body'), (req, res) => {
    /* #swagger.path = '/api/v1/trainers'
       #swagger.tags = ['Treinadores']
       #swagger.summary = 'Cadastrar Treinador'
       #swagger.requestBody = { required: true, content: { 'application/json': { schema: {
         type: 'object', required: ['name', 'age', 'city', 'email'], additionalProperties: false,
         properties: {
           name: { type: 'string', example: 'Misty' }, age: { type: 'integer', example: 16, minimum: 1 },
           city: { type: 'string', example: 'Cerulean' }, email: { type: 'string', format: 'email', example: 'misty@example.com' }
         }
       } } } }
       #swagger.responses[201] = { description: 'Treinador persistido com UUID', content: { 'application/json': { schema: {
         type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Trainer' } }
       } } } }
       #swagger.responses[400] = { description: 'Body inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
       #swagger.responses[409] = { description: 'E-mail já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
       #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
    */
    return controller.create(req, res);
  });
  routes.post(
    '/:trainerId/captures',
    validateRequest(trainerParamsSchema, 'params'),
    validateRequest(capturePokemonSchema, 'body'),
    (req, res) => {
      /* #swagger.path = '/api/v1/trainers/{trainerId}/captures'
         #swagger.tags = ['Treinadores']
         #swagger.summary = 'Capturar Pokémon'
         #swagger.description = 'Consulta a PokéAPI oficial e persiste um snapshot ativo. Cada Treinador pode ter no máximo seis Capturas ativas.'
         #swagger.parameters['trainerId'] = { in: 'path', required: true, type: 'string', format: 'uuid', example: '123e4567-e89b-42d3-a456-426614174000' }
         #swagger.requestBody = { required: true, content: { 'application/json': { schema: {
           type: 'object', required: ['name'], additionalProperties: false, properties: { name: { type: 'string', example: 'pikachu' } }
         } } } }
         #swagger.responses[201] = { description: 'Snapshot ativo persistido', content: { 'application/json': { schema: {
           type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Capture' } }
         } } } }
         #swagger.responses[400] = { description: 'UUID ou body inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[404] = { description: 'Treinador ou Pokémon não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[409] = { description: 'Limite de seis Capturas ativas atingido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[503] = { description: 'PokéAPI indisponível, timeout ou resposta inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.capture(req, res);
    },
  );
  routes.get(
    '/:trainerId/team',
    validateRequest(trainerParamsSchema, 'params'),
    (req, res) => {
      /* #swagger.path = '/api/v1/trainers/{trainerId}/team'
         #swagger.tags = ['Treinadores']
         #swagger.summary = 'Consultar time ativo'
         #swagger.description = 'Retorna somente Capturas ativas; Capturas liberadas continuam preservadas no histórico armazenado.'
         #swagger.parameters['trainerId'] = { in: 'path', required: true, type: 'string', format: 'uuid', example: '123e4567-e89b-42d3-a456-426614174000' }
         #swagger.responses[200] = { description: 'Time ativo', content: { 'application/json': { schema: {
           type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Capture' } } }
         } } } }
         #swagger.responses[400] = { description: 'UUID inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[404] = { description: 'Treinador não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.team(req, res);
    },
  );
  routes.patch(
    '/:trainerId/captures/:captureId/release',
    validateRequest(releaseCaptureParamsSchema, 'params'),
    validateRequest(emptyBodySchema, 'body'),
    (req, res) => {
      /* #swagger.path = '/api/v1/trainers/{trainerId}/captures/{captureId}/release'
         #swagger.tags = ['Treinadores']
         #swagger.summary = 'Liberar Captura'
         #swagger.description = 'Marca a Captura como inativa sem exclusão física. A operação é idempotente: repeti-la devolve 200 e a mesma Captura inativa.'
         #swagger.parameters['trainerId'] = { in: 'path', required: true, type: 'string', format: 'uuid', example: '123e4567-e89b-42d3-a456-426614174000' }
         #swagger.parameters['captureId'] = { in: 'path', required: true, type: 'string', format: 'uuid', example: '123e4567-e89b-42d3-a456-426614174001' }
         #swagger.requestBody = { required: false, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, example: {} } } } }
         #swagger.responses[200] = { description: 'Captura preservada e inativa', content: { 'application/json': { schema: {
           type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Capture' } }
         } } } }
         #swagger.responses[400] = { description: 'UUID ou body inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[404] = { description: 'Captura não encontrada para o Treinador', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
         #swagger.responses[500] = { description: 'Erro interno inesperado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
      */
      return controller.release(req, res);
    },
  );
  return routes;
}
