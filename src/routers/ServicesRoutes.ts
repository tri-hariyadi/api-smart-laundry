import BaseRouter from './BaseRouter';
import ServicesController from '../controllers/ServicesController';
import UploadPhoto from '../middlewares/multer.middleware';

class ServicesRoutes extends BaseRouter {
  routes(): void {
    this.router.post('/services/add', new UploadPhoto('services').uploadMultiple(), ServicesController.create);
    this.router.get('/services/:lat/:long', ServicesController.getServices);
    this.router.get('/services/:id', ServicesController.getService);
    this.router.put('/services/:id', new UploadPhoto('services').uploadMultiple(), ServicesController.update);
    this.router.put('/services/addpromo/:id', ServicesController.addPromo);
    this.router.delete('/services/:id', ServicesController.delete);
  }

}

export default ServicesRoutes;
