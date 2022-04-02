import BaseRouter from './BaseRouter';
import PromoController from '../controllers/PromoController';

class PromoRoutes extends BaseRouter {
  routes(): void {
    this.router.post('/promo/add', PromoController.create);
    this.router.get('/promos/:laundry_id', PromoController.getAll);
    this.router.get('/promo/:id', PromoController.getByServiceId);
    this.router.put('/promo/:id', PromoController.update);
    this.router.delete('/promo/:id', PromoController.delete);
  }

}

export default PromoRoutes;
