import { Request, Response } from 'express';

interface IServicesController {
  create(req: Request, res: Response): void;
  addSubservices(req: Request, res: Response): Promise<void>;
  updateSubServices(req: Request, res: Response): Promise<void>;
  deleteSubServices(req: Request, res: Response): Promise<void>;
  getServices(req: Request, res: Response): void;
  getService(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
  addPromo(req: Request, res: Response): void;
  addRating(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
}

export default IServicesController;
