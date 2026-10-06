import { RequestHandler } from 'express';
import { z } from 'zod';

type RequestPart = 'body' | 'params' | 'query';

export function validateRequest(
  schema: z.ZodType,
  part: RequestPart,
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      return next(result.error);
    }

    const validated = (res.locals.validated ??= {}) as Record<
      RequestPart,
      unknown
    >;
    validated[part] = result.data;
    return next();
  };
}
