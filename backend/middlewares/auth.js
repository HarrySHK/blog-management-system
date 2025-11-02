import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import CustomError from '../lib/ResponseHandler/CustomError.js';
import { userModel } from '../models/user.js';
config();

export default async function Auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(CustomError.unauthorized('Authentication token required'));
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(CustomError.unauthorized('Authentication token required'));
    }
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const findUser = await userModel.findById(decodedToken.userId);
    if (!findUser) {
      return next(CustomError.notFound('User not found'));
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    return next(CustomError.unauthorized('Authentication Failed!'));
  }
}
