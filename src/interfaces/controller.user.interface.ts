import { Request, Response } from 'express';

interface IUserController {
  register(req: Request, res: Response): void;
  login(req: Request, res: Response): void;
  logout(req: Request, res: Response): void;
  changeFcmToken(req: Request, res: Response): void;
  updateUser(req: Request, res: Response): void;
  updatePassword(req: Request, res: Response): void;
  updatePhotoProfile(req: Request, res: Response): void;
  getAllUsers(req: Request, res: Response): void;
  getUserById(req: Request, res: Response): void;
  deleteUser(req: Request, res: Response): void;
  refreshToken(req: Request, res: Response): void;
}

export default IUserController;
