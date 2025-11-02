import { commentModel } from '../models/comment.js';
import { postModel } from '../models/post.js';
import { userModel } from '../models/user.js';
import { createCommentValidation, updateCommentValidation } from '../lib/validators/comment.js';
import CustomError from '../lib/ResponseHandler/CustomError.js';
import CustomSuccess from '../lib/ResponseHandler/CustomSuccess.js';
import logger from '../utils/logger.js';

export const createComment = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { content, post: postId } = req.body;

    const { error } = createCommentValidation.validate(req.body);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return next(CustomError.badRequest(error.details[0].message));
    }

    const post = await postModel.findById(postId);
    if (!post) {
      logger.error('Post not found');
      return next(CustomError.notFound('Post not found'));
    }

    if (post.status !== 'published') {
      logger.error('Cannot comment on unpublished post');
      return next(CustomError.badRequest('Cannot comment on unpublished post'));
    }

    const comment = new commentModel({
      content,
      post: postId,
      author: userId,
      status: 'approved',
    });

    const result = await comment.populate('author', 'name email');
    await result.save();

    logger.info(`Comment created successfully by ${userId}`);

    return next(
      CustomSuccess.createSuccess(
        result,
        'Comment created successfully',
        201
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Create Comment Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await postModel.findById(postId);
    if (!post) {
      logger.error('Post not found');
      return next(CustomError.notFound('Post not found'));
    }

    const comments = await commentModel
      .find({ post: postId, status: 'approved' })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    logger.info(`Comments fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        comments,
        'Comments fetched successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Get Comments Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { content, status } = req.body;

    const { error } = updateCommentValidation.validate(req.body);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return next(CustomError.badRequest(error.details[0].message));
    }

    const comment = await commentModel.findById(id);
    
    if (!comment) {
      logger.error('Comment not found');
      return next(CustomError.notFound('Comment not found'));
    }

    const user = await userModel.findById(userId);
    const userRole = user?.role;

    if (status && userRole !== 'admin') {
      logger.error(`Error of ${userId}: Unauthorized to update comment status`);
      return next(CustomError.forbidden('Only admin can update comment status'));
    }

    if (userRole !== 'admin' && comment.author.toString() !== userId) {
      logger.error(`Error of ${userId}: Unauthorized to update comment`);
      return next(CustomError.forbidden('You are not authorized to update this comment'));
    }

    if (content) comment.content = content;
    if (status) comment.status = status;

    const result = await comment.save();
    await result.populate('author', 'name email');

    logger.info(`Comment updated successfully by ${userId}`);

    return next(
      CustomSuccess.createSuccess(
        result,
        'Comment updated successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Update Comment Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const comment = await commentModel.findById(id);
    
    if (!comment) {
      logger.error('Comment not found');
      return next(CustomError.notFound('Comment not found'));
    }

    const user = await userModel.findById(userId);
    const userRole = user?.role;

    if (userRole !== 'admin' && comment.author.toString() !== userId) {
      logger.error(`Error of ${userId}: Unauthorized to delete comment`);
      return next(CustomError.forbidden('You are not authorized to delete this comment'));
    }

    await commentModel.findByIdAndDelete(id);

    logger.info(`Comment deleted successfully by ${userId}`);

    return next(
      CustomSuccess.createSuccess(
        null,
        'Comment deleted successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Delete Comment Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const getAllComments = async (req, res, next) => {
  try {
    const { status, post } = req.query;

    const query = {};
    if (status) query.status = status;
    if (post) query.post = post;

    const comments = await commentModel
      .find(query)
      .populate('author', 'name email')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    logger.info(`All comments fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        comments,
        'Comments fetched successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Get All Comments Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

