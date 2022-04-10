import { Request,Response } from 'express';

interface IPaymentController {
  bcaPayout(req: Request, res: Response): void
  bcaMutationAccount(req: Request, res: Response): void
}

export default IPaymentController;
