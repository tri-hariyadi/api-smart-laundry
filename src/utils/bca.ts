import crypto from 'crypto';
import axios, { Method } from 'axios';
import { config as dotenv } from 'dotenv';

interface IData {
    CorporateID: string,
    SourceAccountNumber: string,
    TransactionID: string,
    TransactionDate: Date,
    ReferenceID: string,
    CurrencyCode: string,
    Amount: string,
    BeneficiaryAccountNumber: string,
    Remark1: string,
  }

interface IRequest {
    method: Method | undefined,
    url: string,
    data?: IData
}

class BCA {
  private CLIENT_ID: string | undefined;
  private CLIENT_SECRET: string | undefined;
  private API_KEY_SECRET: string | undefined;
  public API_KEY: string | undefined;
  private ACCESS_TOKEN = '';

  constructor() {
    dotenv();
    this.CLIENT_ID = process.env.BCA_CLIENT_ID;
    this.CLIENT_SECRET = process.env.BCA_CLIENT_SECRET;
    this.API_KEY_SECRET = process.env.BCA_API_KEY_SECRET;
    this.API_KEY = process.env.BCA_API_KEY;
  }

  public async service(config: IRequest){
    await this.generateToken();
    const request = this.axiosInstance();
    return request({
      method: config.method,
      url: config.url,
      data: config.data,
    });
  }

  private axiosInstance() {
    const timeStamp = new Date().toISOString();
    const instance = axios.create({
      timeout: 60000,
      baseURL: process.env.BCA_API_BASE_URL,
      headers: {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-BCA-Key': this.API_KEY || '',
        'X-BCA-Timestamp': timeStamp,
      },
      validateStatus: () => true
    });

    // Axios Interceptor generate signature and inject to the headers
    instance.interceptors.request.use(async (config) => {
      const method: string | undefined = config.method?.toUpperCase();
      const signature =
        await this.generateSignature(method, config.url, this.ACCESS_TOKEN, config.data, timeStamp);
      const header = config.headers;
      config.headers = {
        ...header,
        'X-BCA-Signature': signature // inject signature to the headers
      };
      return config;
    });
    return instance;
  }

  public async generateToken() {
    const grantType = 'grant_type=client_credentials';
    try {
      const res = await axios.post(`${process.env.BCA_API_BASE_URL}api/oauth/token`, grantType, {
        headers: {
          Authorization: `Basic ${this.encodeAuthorization()}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }, validateStatus: () => true
      });
      this.ACCESS_TOKEN = res.data.access_token;
    } catch (err) {
      return err;
    }
  }

  private async generateSignature<T>(
      httpMethod: string | undefined, urlPath:string | undefined, accessToken: string,
      body: T, timeStamp: string) {
    const bodyHash = await this.hash(body);
    const stringToSign = `${httpMethod}:/${urlPath}:${accessToken}:${bodyHash}:${timeStamp}`;
    if (this.API_KEY_SECRET)
      return crypto.createHmac('sha256', this.API_KEY_SECRET).update(stringToSign).digest('hex');
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private hash(data: any): string {
    if (typeof data === 'object') data = JSON.stringify(data);
    else data = '';
    return crypto.createHash('sha256').update(data.replace(/\s/g, '')).digest('hex');
  }

  private encodeAuthorization() {
    return Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');
  }
}

export default new BCA();
