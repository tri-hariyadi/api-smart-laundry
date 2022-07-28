import BaseRouter from './BaseRouter';
import OrderController from '../controllers/OrderController';
import AuthMiddleware from '../middlewares/auth.middleware';

class OrderRouter extends BaseRouter {
  routes(): void {
    const authJwt = AuthMiddleware.verifyAccessToken;

    this.router.post('/orders/:action', authJwt, OrderController.create);
    this.router.post('/orders/getall/:id', authJwt, OrderController.getAll);
    this.router.get('/orders/:id/:id_order', authJwt, OrderController.getById);
    this.router.put('/orders/progress/:id', authJwt, OrderController.updateProgress);
    this.router.post('/order/calculateprice', authJwt, OrderController.calculatePrice);
    this.router.post('/orders/reject/:idcust', authJwt, OrderController.rejectOrder);
    this.router.get('/order/getanyorder/:idUser', authJwt, OrderController.getStatusOrder);
    this.router.put('/order/inputweight/:id_order', authJwt, OrderController.inputWeight);
  }
}

export default OrderRouter;
