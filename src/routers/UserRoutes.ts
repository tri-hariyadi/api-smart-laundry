import BaseRouter from './BaseRouter';
import UserController from '../controllers/UserController';
import { verifyApiKeyCredential } from '../middlewares/verifycredentials.middleware';
import DuplicateEmailExeption from '../exceptions/DuplicateEmailExeption';
import UploadPhoto from '../middlewares/multer.middleware';
import AuthMiddleware from '../middlewares/auth.middleware';

class UserRoutes extends BaseRouter {
  routes(): void {
    this.router.post('/users/register',
      [verifyApiKeyCredential, DuplicateEmailExeption], UserController.register);
    this.router.post('/users/login', [verifyApiKeyCredential], UserController.login);
    this.router.post('/users/logout', UserController.logout);
    this.router.get('/users', [verifyApiKeyCredential], UserController.getAllUsers);
    this.router.get('/users/:id', [verifyApiKeyCredential], UserController.getUserById);
    this.router.put('/users/:id', [verifyApiKeyCredential], UserController.updateUser);
    this.router.put('/users/security/:id', [verifyApiKeyCredential], UserController.updatePassword);
    this.router.post('/users/upload/:id',
      [verifyApiKeyCredential, new UploadPhoto('users').uploadSingle()], UserController.updatePhotoProfile);
    this.router.delete('/users/:id', [verifyApiKeyCredential], UserController.deleteUser);
  }
}

export default UserRoutes;
