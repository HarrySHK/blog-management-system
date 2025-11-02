import mongoose from 'mongoose';
import { postModel } from '../models/post.js';
import { userModel } from '../models/user.js';
import { createPostValidation, updatePostValidation, getPostsValidation } from '../lib/validators/post.js';
import CustomError from '../lib/ResponseHandler/CustomError.js';
import CustomSuccess from '../lib/ResponseHandler/CustomSuccess.js';
import logger from '../utils/logger.js';

const { Types } = mongoose;
const ObjectId = Types.ObjectId;

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

    const matchStage = {};
    
    if (status) {
      matchStage.status = status;
    }
    
    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) {
        return next(CustomError.badRequest('Invalid author ID'));
      }
      matchStage.author = new ObjectId(author);
    }
    
    if (search) {
      matchStage.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' },
        },
      });
      pipeline.push({ $sort: { score: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const facetStage = {
      $facet: {
        posts: [
          { $skip: skip },
          { $limit: limitNum },
        ],
        total: [
          { $count: 'count' },
        ],
      },
    };

    pipeline.push(facetStage);

    const result = await postModel.aggregate(pipeline);
    const posts = result[0]?.posts || [];
    const total = result[0]?.total[0]?.count || 0;

    logger.info(`Posts fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          posts,
          pagination: {
            page: parseInt(page),
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.error('Invalid post ID');
      return next(CustomError.notFound('Post not found'));
    }

    const pipeline = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const result = await postModel.aggregate(pipeline);
    
    if (!result || result.length === 0) {
      logger.error('Post not found');
      return next(CustomError.notFound('Post not found'));
    }

    const post = result[0];

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
      await postModel.findByIdAndUpdate(id, { $inc: { views: 1 } });
      post.views = (post.views || 0) + 1;
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
    
    const matchStage = { status: 'published' };
    
    if (search) {
      matchStage.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' },
        },
      });
      pipeline.push({ $sort: { score: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({
      $facet: {
        posts: [
          { $skip: skip },
          { $limit: limitNum },
        ],
        total: [
          { $count: 'count' },
        ],
      },
    });

    const result = await postModel.aggregate(pipeline);
    const posts = result[0]?.posts || [];
    const total = result[0]?.total[0]?.count || 0;

    logger.info(`Public posts fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          posts,
          pagination: {
            page: parseInt(page),
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
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

