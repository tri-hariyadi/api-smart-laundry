import BaseRouter from './BaseRouter';
import PaymentController from '../controllers/PaymentController';
import AuthMiddleware from '../middlewares/auth.middleware';

class PaymentRouter extends BaseRouter {
  routes(): void {
    const authJwt = AuthMiddleware.verifyAccessToken;

    this.router.post('/payment/bca', authJwt, PaymentController.bcaPayout);
    this.router.post('/mutation/bca', authJwt, PaymentController.bcaMutationAccount);
  }
}

export default PaymentRouter;
