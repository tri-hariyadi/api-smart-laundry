import BaseRouter from './BaseRouter';
import LaundryController from '../controllers/LaundryController';

class LaundryRoutes extends BaseRouter {
  routes(): void {
    this.router.post('/laundry/add', LaundryController.create);
    this.router.get('/laundrys', LaundryController.getAll);
    this.router.delete('/laundry/:id', LaundryController.delete);
  }

}

export default LaundryRoutes;
