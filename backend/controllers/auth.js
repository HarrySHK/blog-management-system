import { userModel } from '../models/user.js';
import { refreshTokenModel } from '../models/refreshToken.js';
import bcrypt from 'bcrypt';
import { genToken, genRefreshToken, verifyRefreshToken, cookieOptions } from '../utils/token.js';
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
    const refreshToken = genRefreshToken(result._id, result.email);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenModel.create({
      token: refreshToken,
      user: result._id,
      expiresAt,
    });

    res.cookie('auth-token', token, cookieOptions);
    res.cookie('refresh-token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    logger.info(`${result._id} registered successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          token,
          refreshToken,
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
    const refreshToken = genRefreshToken(user._id, user.email);

    await refreshTokenModel.deleteMany({ user: user._id });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenModel.create({
      token: refreshToken,
      user: user._id,
      expiresAt,
    });

    res.cookie('auth-token', token, cookieOptions);
    res.cookie('refresh-token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    logger.info(`${user._id} Login Successful`);

    return next(
      CustomSuccess.createSuccess(
        {
          token,
          refreshToken,
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

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies['refresh-token'];

    if (!refreshToken) {
      logger.error('Refresh token not provided');
      return next(CustomError.unauthorized('Refresh token is required'));
    }

    const existingToken = await refreshTokenModel.findOne({ token: refreshToken });
    if (!existingToken) {
      logger.error('Invalid refresh token');
      return next(CustomError.unauthorized('Invalid refresh token'));
    }

    if (existingToken.expiresAt < new Date()) {
      await refreshTokenModel.deleteOne({ token: refreshToken });
      logger.error('Refresh token expired');
      return next(CustomError.unauthorized('Refresh token has expired'));
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded || decoded.type !== 'refresh') {
      logger.error('Invalid refresh token signature');
      return next(CustomError.unauthorized('Invalid refresh token'));
    }

    const user = await userModel.findById(decoded.userId);
    if (!user) {
      logger.error('User not found');
      return next(CustomError.notFound('User not found'));
    }

    const newToken = genToken(user._id, user.email);

    res.cookie('auth-token', newToken, cookieOptions);

    logger.info(`${user._id} Token refreshed successfully`);

    return next(
      CustomSuccess.createSuccess(
        {
          token: newToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        'Token refreshed successfully',
        200
      )
    );
  } catch (error) {
    console.error(error);
    logger.error(`Refresh Token Error: ${error}`);
    return next(CustomError.internal('Internal Server Error'));
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies['refresh-token'];
    
    if (refreshToken) {
      await refreshTokenModel.deleteOne({ token: refreshToken });
    }

    res
      .status(200)
      .cookie('auth-token', '', { ...cookieOptions, maxAge: 0 })
      .cookie('refresh-token', '', { ...cookieOptions, maxAge: 0 })
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

