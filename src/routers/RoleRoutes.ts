import BaseRouter from './BaseRouter';
import RoleController from '../controllers/RoleController';
import { verifyApiKeyCredential } from '../middlewares/verifycredentials.middleware';

class RoleRoutes extends BaseRouter {
  routes(): void {
    this.router.post('/role/create', verifyApiKeyCredential, RoleController.create);
    this.router.get('/roles', verifyApiKeyCredential, RoleController.getRoles);
    this.router.get('/roles/:id', verifyApiKeyCredential, RoleController.getRole);
    this.router.put('/roles/:id', verifyApiKeyCredential, RoleController.updateRole);
    this.router.delete('/roles/:id', verifyApiKeyCredential, RoleController.deleteRole);
  }
}

export default RoleRoutes;
