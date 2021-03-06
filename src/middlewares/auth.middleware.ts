import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import { config as dotenv } from 'dotenv';
import config, { IConfig } from '../utils/config';
import AuthException from '../exceptions/AuthException';
import client from '../utils/initRedis';

interface DataPayload { aud: string }
class AuthMiddleware {
  private ACCESS_TOKEN_SECRET: string;
  private REFRESH_TOKEN_SECRET: string;

  constructor() {
    dotenv();
    this.ACCESS_TOKEN_SECRET =
      config(process.env.NODE_ENV as keyof IConfig)?.ACCESS_TOKEN_SECRET || '';
    this.REFRESH_TOKEN_SECRET =
      config(process.env.NODE_ENV as keyof IConfig)?.REFRESH_TOKEN_SECRET || '';
  }

  private getBearerToken = (req: Request) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return null;
    const bearer = bearerHeader.split(' ');
    return bearer[1];
  };

  public verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = this.getBearerToken(req);
    if (!bearerToken) return next(new AuthException('Autentikasi token tidak ada'));

    jwt.verify(bearerToken, this.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) return next(new AuthException('Autentikasi token tidak valid'));
      const data: DataPayload = payload as DataPayload;
      client.lRange(data.aud, 0, -1)
        .then((reply) => {
          if (reply.length) {
            for (let i = 0; i < reply.length; i++) {
              const item = reply[i];
              if (bearerToken === JSON.parse(item).accessToken) return next();
              else if (i === (reply.length - 1)) return next(new AuthException('Autentikasi token tidak valid'));
            }
          } else {
            next(new AuthException('Autentikasi token tidak valid'));
          }
        })
        .catch(() => {
          next(new AuthException('Autentikasi token tidak valid'));
        });
    });
  };

  public verifyRefreshToken = (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = this.getBearerToken(req);
    if (!bearerToken) return next(new AuthException('Autentikasi token tidak ada'));

    jwt.verify(bearerToken, this.REFRESH_TOKEN_SECRET, (err, payload) => {
      if (err) return next(new AuthException('Autentikasi token tidak valid'));
      const data: DataPayload = payload as DataPayload;
      client.lRange(data.aud, 0, -1)
        .then((reply) => {
          if (reply.length) {
            for (let i = 0; i < reply.length; i++) {
              const item = reply[i];
              if (bearerToken === JSON.parse(item).refreshToken) return next();
              else if (i === (reply.length - 1)) return next(new AuthException('Autentikasi token tidak valid'));
            }
          } else {
            next(new AuthException('Autentikasi token tidak valid'));
          }
        })
        .catch(() => {
          next(new AuthException('Autentikasi token tidak valid'));
        });
    });
  };

}

export default new AuthMiddleware();
