import CustomError from '../lib/ResponseHandler/CustomError.js';
import { userModel } from '../models/user.js';

export const adminAuth = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return next(CustomError.notFound('User not found'));
    }
    
    if (user.role !== 'admin') {
      return next(CustomError.forbidden('Admin access required'));
    }
    
    next();
  } catch (error) {
    console.log(error);
    return next(CustomError.unauthorized('Authorization Failed'));
  }
};

