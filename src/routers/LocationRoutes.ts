import BaseController from './BaseRouter';
import LocationController from '../controllers/LocationController';

class LocationRoutes extends BaseController {
  public routes(): void {
    this.router.get('/location/', LocationController.index);
  }
}

export default LocationRoutes;
