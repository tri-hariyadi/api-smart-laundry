import BaseRouter from './BaseRouter';
import PaymentController from '../controllers/PaymentController';

class PaymentRouter extends BaseRouter {
  routes(): void {
    this.router.post('/payment/bca', PaymentController.bcaPayout);
    this.router.post('/mutation/bca', PaymentController.bcaMutationAccount);
  }
}

export default PaymentRouter;
