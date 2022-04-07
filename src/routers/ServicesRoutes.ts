import BaseRouter from './BaseRouter';
import ServicesController from '../controllers/ServicesController';
import UploadPhoto from '../middlewares/multer.middleware';

class ServicesRoutes extends BaseRouter {
  routes(): void {
    const Uploads = new UploadPhoto('services');

    this.router.post('/services/add', Uploads.uploadMultiple(), ServicesController.create);
    this.router.get('/services/:lat/:long', ServicesController.getServices);
    this.router.post('/services/:id', ServicesController.getService);
    this.router.put('/services/:id', Uploads.uploadMultiple(), ServicesController.update);
    this.router.put('/services/addpromo/:id', ServicesController.addPromo);
    this.router.delete('/services/:id', ServicesController.delete);
    this.router.put('/subservices/:id',
      Uploads.uploadSingle(), ServicesController.addSubservices);
    this.router.put('/subservices/:id/:id_sub',
      Uploads.uploadSingle(), ServicesController.updateSubServices);
    this.router.put('/subservices/delete/:id/:id_sub', ServicesController.deleteSubServices);
    this.router.post('/services/rating/:id', ServicesController.addRating);
  }

}

export default ServicesRoutes;
