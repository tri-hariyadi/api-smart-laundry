import BaseRouter from './BaseRouter';
import OrderController from '../controllers/OrderController';

class OrderRouter extends BaseRouter {
  routes(): void {
    this.router.post('/orders', OrderController.create);
    this.router.get('/orders/:id', OrderController.create);
    this.router.get('/orders/:id/:id_order', OrderController.create);
  }
}

export default OrderRouter;
