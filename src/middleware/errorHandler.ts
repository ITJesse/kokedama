import { NextFunction, Request, Response } from 'express'

export function errorHandler(
  err: TypeError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let customError = err
  res.status(500).send(customError)
}
