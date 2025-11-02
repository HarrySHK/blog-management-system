import { Router } from 'express';
import * as controller from '../controllers/comment.js';
import Auth from '../middlewares/auth.js';
import { adminAuth } from '../middlewares/admin.js';

const commentRouter = Router();

commentRouter.route('/post/:postId').get(controller.getComments);
commentRouter.route('/').post(Auth, controller.createComment);
commentRouter.route('/:id').put(Auth, controller.updateComment);
commentRouter.route('/:id').delete(Auth, controller.deleteComment);
commentRouter.route('/admin/all').get(Auth, adminAuth, controller.getAllComments);

export default commentRouter;

