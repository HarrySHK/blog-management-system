import { Router } from 'express';
import * as controller from '../controllers/post.js';
import Auth from '../middlewares/auth.js';
import { authorAuth } from '../middlewares/author.js';
import { adminAuth } from '../middlewares/admin.js';
import { upload } from '../middlewares/multer.js';

const postRouter = Router();

postRouter.route('/public').get(controller.getPublicPosts);
postRouter.route('/').get(Auth, controller.getPosts);
postRouter.route('/:id').get(Auth, controller.getPost);
postRouter.route('/').post(Auth, authorAuth, upload.single('image'), controller.createPost);
postRouter.route('/:id').put(Auth, authorAuth, upload.single('image'), controller.updatePost);
postRouter.route('/:id').delete(Auth, authorAuth, controller.deletePost);

export default postRouter;

