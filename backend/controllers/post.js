import { postModel } from '../models/post.js';
import { userModel } from '../models/user.js';
import { createPostValidation, updatePostValidation, getPostsValidation } from '../lib/validators/post.js';
import CustomError from '../lib/ResponseHandler/CustomError.js';
import CustomSuccess from '../lib/ResponseHandler/CustomSuccess.js';
import logger from '../utils/logger.js';

export const createPost = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { title, content, excerpt, status, tags } = req.body;

    const { error } = createPostValidation.validate(req.body);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return next(CustomError.badRequest(error.details[0].message));
    }

    const post = new postModel({
      title,
      content,
      excerpt,
      author: userId,
      status: status || 'draft',
      tags: tags || [],
    });

    const result = await post.populate('author', 'name email');
    await result.save();

    logger.info(`Post created successfully by ${userId}`);

    return next(
      CustomSuccess.createSuccess(
        result,
        'Post created successfully',
        201
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Create Post Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, author } = req.query;
    const { error } = getPostsValidation.validate(req.query);
    
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return next(CustomError.badRequest(error.details[0].message));
    }

    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (author) {
      query.author = author;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let postsQuery = postModel.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (search) {
      postsQuery = postsQuery.sort({ score: { $meta: 'textScore' } });
    }

    const posts = await postsQuery;
    const total = await postModel.countDocuments(query);

    logger.info(`Posts fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          posts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
        'Posts fetched successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Get Posts Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await postModel.findById(id).populate('author', 'name email');
    
    if (!post) {
      logger.error('Post not found');
      return next(CustomError.notFound('Post not found'));
    }

    if (post.status === 'draft') {
      const { userId } = req.user || {};
      if (!userId) {
        return next(CustomError.forbidden('Access denied'));
      }
      const user = await userModel.findById(userId);
      if (!user || (user.role !== 'admin' && userId !== post.author._id.toString())) {
        return next(CustomError.forbidden('Access denied'));
      }
    } else {
      post.views += 1;
      await post.save();
    }

    logger.info(`Post fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        post,
        'Post fetched successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Get Post Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const userRole = req.userRole;
    const { title, content, excerpt, status, tags } = req.body;

    const { error } = updatePostValidation.validate(req.body);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return next(CustomError.badRequest(error.details[0].message));
    }

    const post = await postModel.findById(id);
    
    if (!post) {
      logger.error('Post not found');
      return next(CustomError.notFound('Post not found'));
    }

    if (userRole !== 'admin' && post.author.toString() !== userId) {
      logger.error(`Error of ${userId}: Unauthorized to update post`);
      return next(CustomError.forbidden('You are not authorized to update this post'));
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (status) post.status = status;
    if (tags) post.tags = tags;

    const result = await post.save();
    await result.populate('author', 'name email');

    logger.info(`Post updated successfully by ${userId}`);

    return next(
      CustomSuccess.createSuccess(
        result,
        'Post updated successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Update Post Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const userRole = req.userRole;

    const post = await postModel.findById(id);
    
    if (!post) {
      logger.error('Post not found');
      return next(CustomError.notFound('Post not found'));
    }

    if (userRole !== 'admin' && post.author.toString() !== userId) {
      logger.error(`Error of ${userId}: Unauthorized to delete post`);
      return next(CustomError.forbidden('You are not authorized to delete this post'));
    }

    await postModel.findByIdAndDelete(id);

    logger.info(`Post deleted successfully by ${userId}`);

    return next(
      CustomSuccess.createSuccess(
        null,
        'Post deleted successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Delete Post Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const getPublicPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = { status: 'published' };
    
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let postsQuery = postModel.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (search) {
      postsQuery = postsQuery.sort({ score: { $meta: 'textScore' } });
    }

    const posts = await postsQuery;
    const total = await postModel.countDocuments(query);

    logger.info(`Public posts fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          posts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
        'Posts fetched successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Get Public Posts Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

