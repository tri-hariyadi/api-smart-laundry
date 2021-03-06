import { Request, Response } from 'express';

interface ILaundryController {
  create(req: Request, res: Response): void;
  getAll(req: Request, res: Response): void;
  online(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
}

export default ILaundryController;
