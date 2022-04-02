import App from './app';
import LocationRoutes from './routers/LocationRoutes';
import UserRoutes from './routers/UserRoutes';
import RoleRoutes from './routers/RoleRoutes';
import LaundryRoutes from './routers/LaundryRoutes';
import PromoRoutes from './routers/PromoRoutes';
import ServicesRoutes from './routers/ServicesRoutes';

const app = new App([
  new LocationRoutes(),
  new UserRoutes(),
  new RoleRoutes(),
  new LaundryRoutes(),
  new PromoRoutes(),
  new ServicesRoutes()
]);

app.listen();
