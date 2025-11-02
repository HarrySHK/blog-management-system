import CustomError from '../lib/ResponseHandler/CustomError.js';
import { userModel } from '../models/user.js';

export const authorAuth = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return next(CustomError.notFound('User not found'));
    }
    
    if (user.role !== 'admin' && user.role !== 'author') {
      return next(CustomError.forbidden('Author or admin access required'));
    }
    
    req.userRole = user.role;
    next();
  } catch (error) {
    console.log(error);
    return next(CustomError.unauthorized('Authorization Failed'));
  }
};

