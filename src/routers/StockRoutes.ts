import BaseRouter from './BaseRouter';
import StockController from '../controllers/StockController';
import AuthMiddleware from '../middlewares/auth.middleware';

class StockRoutes extends BaseRouter {
  routes(): void {
    const authJwt = AuthMiddleware.verifyAccessToken;

    this.router.post('/stock/create', authJwt, StockController.create);
    this.router.post('/stock', authJwt, StockController.getAll);
    this.router.put('/stock/update/:id', authJwt, StockController.update);
    this.router.delete('/stock/:id', authJwt, StockController.delete);
  }

}

export default StockRoutes;
