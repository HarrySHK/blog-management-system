import { Router } from 'express';
import * as controller from '../controllers/user.js';
import Auth from '../middlewares/auth.js';
import { adminAuth } from '../middlewares/admin.js';

const userRouter = Router();

userRouter.route('/profile').get(Auth, controller.getProfile);
userRouter.route('/stats').get(Auth, controller.getUserStats);
userRouter.route('/').get(Auth, adminAuth, controller.getAllUsers);

export default userRouter;

