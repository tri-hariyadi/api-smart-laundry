import BaseRouter from './BaseRouter';
import UserController from '../controllers/UserController';
import DuplicateEmailExeption from '../exceptions/DuplicateEmailExeption';
import UploadPhoto from '../middlewares/multer.middleware';
import AuthMiddleware from '../middlewares/auth.middleware';

class UserRoutes extends BaseRouter {
  routes(): void {
    const authJwt = AuthMiddleware.verifyAccessToken;
    const authRefreshToken = AuthMiddleware.verifyRefreshToken;

    this.router.post('/users/register', DuplicateEmailExeption, UserController.register);
    this.router.post('/users/login', UserController.login);
    this.router.post('/users/logout', UserController.logout);
    this.router.get('/users', authJwt, UserController.getAllUsers);
    this.router.get('/users/:role/:id', authJwt, UserController.getUserById);
    this.router.put('/users/:id', authJwt, UserController.updateUser);
    this.router.put('/users/security/:id', authJwt, UserController.updatePassword);
    this.router.post('/users/upload/:id',
      [authJwt, new UploadPhoto('users').uploadSingle()], UserController.updatePhotoProfile);
    this.router.delete('/users/:id', authJwt, UserController.deleteUser);
    this.router.get('/users/token/refresh', authRefreshToken, UserController.refreshToken);
    this.router.post('/users/changefcmtoken', UserController.changeFcmToken);
  }
}

export default UserRoutes;
