import mongoose from 'mongoose';
import { userModel } from '../models/user.js';
import { postModel } from '../models/post.js';
import CustomError from '../lib/ResponseHandler/CustomError.js';
import CustomSuccess from '../lib/ResponseHandler/CustomSuccess.js';
import logger from '../utils/logger.js';

const { Types } = mongoose;
const ObjectId = Types.ObjectId;

export const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await userModel.findById(userId).select('-password');
    
    if (!user) {
      logger.error('User not found');
      return next(CustomError.notFound('User not found'));
    }

    logger.info(`Profile fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        user,
        'Profile fetched successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Get Profile Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const matchStage = {};
    if (role) matchStage.role = role;
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          password: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          users: [
            { $skip: skip },
            { $limit: limitNum },
          ],
          total: [
            { $count: 'count' },
          ],
        },
      },
    ];

    const result = await userModel.aggregate(pipeline);
    const users = result[0]?.users || [];
    const total = result[0]?.total[0]?.count || 0;

    logger.info(`Users fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          users,
          pagination: {
            page: parseInt(page),
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
        'Users fetched successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Get Users Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.error('Invalid user ID');
      return next(CustomError.badRequest('Invalid user ID'));
    }

    const pipeline = [
      {
        $match: { author: new ObjectId(userId) },
      },
      {
        $facet: {
          totalPosts: [
            { $count: 'count' },
          ],
          publishedPosts: [
            {
              $match: { status: 'published' },
            },
            { $count: 'count' },
          ],
          draftPosts: [
            {
              $match: { status: 'draft' },
            },
            { $count: 'count' },
          ],
        },
      },
    ];

    const result = await postModel.aggregate(pipeline);
    const stats = result[0] || {};

    const totalPosts = stats.totalPosts?.[0]?.count || 0;
    const publishedPosts = stats.publishedPosts?.[0]?.count || 0;
    const draftPosts = stats.draftPosts?.[0]?.count || 0;

    logger.info(`User stats fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          totalPosts,
          publishedPosts,
          draftPosts,
        },
        'User stats fetched successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Get User Stats Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

