import { Request, Response } from 'express';

interface IServicesController {
  create(req: Request, res: Response): void;
  getServices(req: Request, res: Response): void;
  getService(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
}

export default IServicesController;
