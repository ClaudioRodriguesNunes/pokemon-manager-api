import { readFileSync } from 'fs';
import path from 'path';

import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerOutputPath = path.resolve(
  process.cwd(),
  'src/main/config/swagger-output.json',
);

const swaggerDocument = JSON.parse(readFileSync(swaggerOutputPath, 'utf-8'));

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
