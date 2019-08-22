import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authConfig from './app/middlewares/auth';

const routes = Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// check if request has autorization header for all routes above
routes.use(authConfig);

routes.put('/users/:id', UserController.update);

export default routes;
