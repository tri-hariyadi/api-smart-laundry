import { Request, Response } from 'express';

interface IRoleController {
  create(req: Request, res: Response): void;
  getRoles(req: Request, res: Response): void;
  getRole(req: Request, res: Response): void;
  updateRole(req: Request, res: Response): void;
  deleteRole(req: Request, res: Response): void;
}

export default IRoleController;
