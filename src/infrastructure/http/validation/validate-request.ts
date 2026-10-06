import { Request, RequestHandler } from 'express';
import { z } from 'zod';

type RequestPart = 'body' | 'params' | 'query';

export function validateRequest(
  schema: z.ZodType,
  part: RequestPart,
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      return next(result.error);
    }

    (req as Request)[part] = result.data;
    return next();
  };
}
