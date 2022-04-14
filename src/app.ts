/* eslint-disable no-console */
import express, { Application } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config as dotenv } from 'dotenv';
import errorMiddleware from './middlewares/error.middleware';
import NotfoundException from './exceptions/NotfoundException';
import BaseRouter from './routers/BaseRouter';
import initDB from './utils/initDB';
import { verifyApiKeyCredential } from './middlewares/verifycredentials.middleware';

class App {
  public app: Application;

  constructor(controller: Array<BaseRouter>) {
    this.app = express();
    this.connectToTheDatabase();
    this.plugins();
    this.initializeControllers(controller);
    this.notFoundErrorHandling();
    this.initializeErrorHandling();
    dotenv();
  }

  protected plugins(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({
      extended: true
    }));
    this.app.use(cookieParser());
    this.app.use(verifyApiKeyCredential);
    this.app.use(morgan('dev'));
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use('/public', express.static('public'));
  }

  private notFoundErrorHandling() {
    this.app.use(NotfoundException);
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Array<BaseRouter>) {
    controllers.forEach((controller) => {
      this.app.use('/api/v1', controller.router);
    });
  }

  private connectToTheDatabase() {
    initDB();
  }

  public listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  }
}

export default App;
