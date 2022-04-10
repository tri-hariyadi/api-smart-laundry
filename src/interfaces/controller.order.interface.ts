import { Request, Response } from 'express';

interface IOrderController {
  create(req: Request, res: Response): void;
  getAll(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
}

export default IOrderController;
