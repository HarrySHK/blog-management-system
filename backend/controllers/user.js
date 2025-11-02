import { userModel } from '../models/user.js';
import { postModel } from '../models/post.js';
import CustomError from '../lib/ResponseHandler/CustomError.js';
import CustomSuccess from '../lib/ResponseHandler/CustomSuccess.js';
import logger from '../utils/logger.js';

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

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await userModel
      .find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await userModel.countDocuments(query);

    logger.info(`Users fetched successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
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

    const totalPosts = await postModel.countDocuments({ author: userId });
    const publishedPosts = await postModel.countDocuments({ author: userId, status: 'published' });
    const draftPosts = await postModel.countDocuments({ author: userId, status: 'draft' });

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

