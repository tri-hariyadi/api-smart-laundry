import BaseRouter from './BaseRouter';
import LaundryController from '../controllers/LaundryController';
import AuthMiddleware from '../middlewares/auth.middleware';

class LaundryRoutes extends BaseRouter {
  routes(): void {
    const authJwt = AuthMiddleware.verifyAccessToken;

    this.router.post('/laundry/add', authJwt, LaundryController.create);
    this.router.get('/laundrys', authJwt, LaundryController.getAll);
    this.router.delete('/laundry/:id', authJwt, LaundryController.delete);
  }

}

export default LaundryRoutes;
