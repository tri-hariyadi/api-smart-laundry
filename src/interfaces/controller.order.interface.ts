import { Request, Response } from 'express';

interface IOrderController {
  create(req: Request, res: Response): Promise<void>;
  getAll(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  updateProgress(req: Request, res: Response): Promise<void>;
  rejectOrder(req: Request, res: Response): void;
  getStatusOrder(req: Request, res: Response): void;
  calculatePrice(req: Request, res: Response): Promise<Response>;
  inputWeight(req: Request, res: Response): void;
}

export default IOrderController;
