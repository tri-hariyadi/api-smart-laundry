import BaseRouter from './BaseRouter';
import PromoController from '../controllers/PromoController';
import AuthMiddleware from '../middlewares/auth.middleware';

class PromoRoutes extends BaseRouter {
  routes(): void {
    const authJwt = AuthMiddleware.verifyAccessToken;

    this.router.post('/promo/add', authJwt, PromoController.create);
    this.router.get('/promos/:laundry_id', authJwt, PromoController.getAll);
    this.router.get('/promo/:id', authJwt, PromoController.getByServiceId);
    this.router.put('/promo/:id', authJwt, PromoController.update);
    this.router.delete('/promo/:id', authJwt, PromoController.delete);
  }

}

export default PromoRoutes;
