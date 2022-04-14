import BaseRouter from './BaseRouter';
import OrderController from '../controllers/OrderController';
import AuthMiddleware from '../middlewares/auth.middleware';

class OrderRouter extends BaseRouter {
  routes(): void {
    const authJwt = AuthMiddleware.verifyAccessToken;

    this.router.post('/orders', authJwt, OrderController.create);
    this.router.get('/orders/:id', authJwt, OrderController.getAll);
    this.router.get('/orders/:id/:id_order', authJwt, OrderController.getById);
    this.router.put('/orders/progress/:id', authJwt, OrderController.updateProgress);
  }
}

export default OrderRouter;
