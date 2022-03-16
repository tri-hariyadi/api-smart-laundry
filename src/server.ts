import App from './app';
import LocationRoutes from './routers/LocationRoutes';
import UserRoutes from './routers/UserRoutes';
import RoleRoutes from './routers/RoleRoutes';

const app = new App([
  new LocationRoutes(),
  new UserRoutes(),
  new RoleRoutes()
]);

app.listen();
