import BaseRouter from './BaseRouter';
import ServicesController from '../controllers/ServicesController';
import UploadPhoto from '../middlewares/multer.middleware';
import AuthMiddleware from '../middlewares/auth.middleware';

class ServicesRoutes extends BaseRouter {
  routes(): void {
    const Uploads = new UploadPhoto('services');
    const authJwt = AuthMiddleware.verifyAccessToken;

    this.router.post('/services/add', [authJwt, Uploads.uploadMultiple()], ServicesController.create);
    this.router.get('/services/:lat/:long', authJwt, ServicesController.getServices);
    this.router.post('/services/:id', authJwt, ServicesController.getService);
    this.router.get('/services/:idLaundry', authJwt, ServicesController.getServiceByLaundry);
    this.router.put('/services/:id', [authJwt, Uploads.uploadMultiple()], ServicesController.update);
    this.router.put('/services/addpromo/:id', authJwt, ServicesController.addPromo);
    this.router.delete('/services/:id', authJwt, ServicesController.delete);
    this.router.put('/subservices/:id', [authJwt, Uploads.uploadSingle()], ServicesController.addSubservices);
    this.router.put('/subservices/:id/:id_sub',
      [authJwt, Uploads.uploadSingle()], ServicesController.updateSubServices);
    this.router.put('/subservices/delete/:id/:id_sub', authJwt, ServicesController.deleteSubServices);
    this.router.post('/services/add/rating', authJwt, ServicesController.addRating);
    this.router.get('/services/get/rating/:id', authJwt, ServicesController.getRating);
  }

}

export default ServicesRoutes;
