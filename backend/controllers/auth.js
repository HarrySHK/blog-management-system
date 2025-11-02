import { userModel } from '../models/user.js';
import bcrypt from 'bcrypt';
import { genToken, cookieOptions } from '../utils/token.js';
import { registerValidation, loginValidation } from '../lib/validators/auth.js';
import CustomError from '../lib/ResponseHandler/CustomError.js';
import CustomSuccess from '../lib/ResponseHandler/CustomSuccess.js';
import logger from '../utils/logger.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const { error } = registerValidation.validate(req.body);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return next(CustomError.badRequest(error.details[0].message));
    }

    const existingUser = await userModel.findOne({ email }, { _id: 1 });
    if (existingUser) {
      logger.error('Email already exists');
      return next(CustomError.badRequest('Email already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      role: role || 'author',
    });

    const result = await user.save();
    const token = genToken(result._id, result.email);

    res.cookie('auth-token', token, cookieOptions);

    logger.info(`${result._id} registered successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          token,
          user: {
            id: result._id,
            name: result.name,
            email: result.email,
            role: result.role,
          },
        },
        'Registration successful',
        201
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Registration Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { error } = loginValidation.validate(req.body);
    if (error) {
      logger.error(`Validation Error: ${error.details[0].message}`);
      return next(CustomError.badRequest(error.details[0].message));
    }

    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      logger.error('User not found');
      return next(CustomError.badRequest('Invalid email or password'));
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      logger.error(`Error of ${user._id}: Password does not match`);
      return next(CustomError.badRequest('Invalid email or password'));
    }

    const token = genToken(user._id, user.email);

    res.cookie('auth-token', token, cookieOptions);

    logger.info(`${user._id} Login Successful`);

    return next(
      CustomSuccess.createSuccess(
        {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        'Login Successful',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Login Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie('auth-token', '', { ...cookieOptions, maxAge: 0 })
      .json({
        success: true,
        message: 'Logged out successfully',
      });

    logger.info('User logged out successfully.');
  } catch (error) {
    console.error(error);
    logger.error(`Logout Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

