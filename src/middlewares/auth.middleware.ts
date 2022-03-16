import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import DataStoredInToken from '../interfaces/dataStoredInToken';
import config, { IConfig } from '../utils/config';
import AuthException from '../exceptions/AuthException';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import User from '../models/UserModel';

async function authMiddleware(request: Request, res: Response, next: NextFunction ) {
  const cookies = request.cookies;
  if (cookies && cookies.Authorization) {
    const SECRET = config(process.env.NODE_ENV as keyof IConfig)?.SECRET || '';
    try {
      const verificationResponse = jwt.verify(cookies.Authorization, SECRET) as DataStoredInToken;
      const id = verificationResponse.id;
      const user = await User.findById(id);
      if (user) {
        // request.user = user;
        next();
      } else {
        next(new AuthException('Autentikasi token tidak valid'));
      }
    } catch (error) {
      next(new AuthException('Autentikasi token tidak valid'));
    }
  } else {
    next(new AuthException('Autentikasi token tidak ada'));
  }
}

export default authMiddleware;
