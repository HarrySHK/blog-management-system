import { Router } from 'express';
import * as controller from '../controllers/auth.js';
import Auth from '../middlewares/auth.js';

const authRouter = Router();

authRouter.route('/register').post(controller.register);
authRouter.route('/login').post(controller.login);
authRouter.route('/logout').post(Auth, controller.logout);

export default authRouter;

