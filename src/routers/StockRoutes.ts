import BaseRouter from './BaseRouter';
import StockController from '../controllers/StockController';
import AuthMiddleware from '../middlewares/auth.middleware';

class StockRoutes extends BaseRouter {
  routes(): void {
    const authJwt = AuthMiddleware.verifyAccessToken;

    //create
    this.router.post('/stocks/create', authJwt, StockController.create);
    this.router.post('/stocks/inout/create', authJwt, StockController.createInOut);
    //read
    this.router.get('/stocks/:id_laundry', authJwt, StockController.getAllStock);
    this.router.post('/stocks/:id_laundry', authJwt, StockController.getStock);
    this.router.post('/stocks/inout/:id_laundry', authJwt, StockController.getInOut);
    //update
    this.router.put('/stocks/:id', authJwt, StockController.update);
    this.router.put('/stocks/inout/:id', authJwt, StockController.updateInOut);
    //delete
    this.router.delete('/stocks/:id', authJwt, StockController.deleteStock);
    this.router.delete('/stocks/inout/:id', authJwt, StockController.deleteInOut);
  }

}

export default StockRoutes;
