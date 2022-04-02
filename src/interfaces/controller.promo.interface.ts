import { Response, Request } from 'express';

interface IPromoController {
  create(req: Request, res: Response): void;
  getAll(req: Request, res: Response): void;
  getByServiceId(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
}

export default IPromoController;
