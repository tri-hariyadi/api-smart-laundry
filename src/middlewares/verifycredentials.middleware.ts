import { Request, Response, NextFunction } from 'express';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import config, { IConfig } from '../utils/config';

export const verifyApiKeyCredential = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-Api-Key');
  if (apiKey !== config(process.env.NODE_ENV as keyof IConfig).APIKEY) {
    const error = new WrongCredentialsException();
    const status = error.status;
    const message = error.message;
    return res.status(401).send({
      message,
      status,
    });
  }
  next();
};
