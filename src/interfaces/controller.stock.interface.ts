import { Request, Response } from 'express';

interface ILaundryController {
  create(req: Request, res: Response): void;
  createInOut(req: Request, res: Response): void;
  getAllStock(req: Request, res: Response): void;
  getStock(req: Request, res: Response): void;
  getInOut(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
  updateInOut(req: Request, res: Response): void;
  deleteStock(req: Request, res: Response): Promise<void>;
  deleteInOut(req: Request, res: Response): void;
}

export default ILaundryController;
