import type { Request, Response, NextFunction, RequestHandler } from 'express'

// Express 4 does not forward rejected promises from async handlers to
// the error middleware on its own — this wraps each one so thrown
// errors (HttpError, ZodError, etc.) reach errorHandler instead of
// crashing the process or hanging the request.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}
