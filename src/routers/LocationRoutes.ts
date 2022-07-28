import BaseController from './BaseRouter';
import LocationController from '../controllers/LocationController';
import NotifController from '../controllers/NotifController';

class LocationRoutes extends BaseController {
  public routes(): void {
    this.router.get('/location/', LocationController.index);
    this.router.get('/events/:id', NotifController.events);
    // this.router.post('/send-event/:id', NotifController.sendEventNotif);
  }
}

export default LocationRoutes;
