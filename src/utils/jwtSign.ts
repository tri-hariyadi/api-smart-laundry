import jwt, { JwtPayload } from 'jsonwebtoken';
import config, { IConfig } from './config';
import client from './initRedis';
import { UserDocument } from '../models/UserModel';

class JwtSign {
  private EXPIRES_IN = 60*60;
  private ACCESS_TOKEN_SECRET = config(process.env.NODE_ENV as keyof IConfig)?.ACCESS_TOKEN_SECRET || '';
  private REFRESH_TOKEN_SECRET = config(process.env.NODE_ENV as keyof IConfig)?.REFRESH_TOKEN_SECRET || '';
  private payload: JwtPayload = {};
  private user: UserDocument;

  constructor(userData: UserDocument) {
    this.user = userData;
  }

  public createToken() {
    return new Promise((resolve, reject) => {
      const optionsAccessToken = {
        expiresIn: this.EXPIRES_IN,
        issuer: 'smartlaundry.com',
        audience: this.user.id,
      };
      const optionsRefreshToken = {
        expiresIn: 2 * this.EXPIRES_IN,
        issuer: 'smartlaundry.com',
        audience: this.user.id,
      };
      const payloads = {
        accessToken: jwt.sign(this.payload, this.ACCESS_TOKEN_SECRET, optionsAccessToken),
        refreshToken: jwt.sign(this.payload, this.REFRESH_TOKEN_SECRET, optionsRefreshToken),
      };
      client.set(this.user.id, JSON.stringify(payloads), { EX: 2 * this.EXPIRES_IN })
        .then(() => resolve(payloads))
        .catch(err => reject(JSON.parse(JSON.stringify(err))));
    });
  }
}

export default JwtSign;
