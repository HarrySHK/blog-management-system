import Joi from 'joi';

export const registerValidation = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'any.required': 'Name is required',
    'string.empty': 'Name is not allowed to be empty',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be less than 50 characters',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email is not allowed to be empty',
    'string.email': 'Please enter a valid email',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must contain at least 8 characters',
    'any.required': 'Password is required',
    'string.empty': 'Password is not allowed to be empty',
  }),
  role: Joi.string().valid('admin', 'author').optional().messages({
    'any.only': 'Role must be either admin or author',
  }),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email is not allowed to be empty',
    'string.email': 'Please enter a valid email',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is not allowed to be empty',
  }),
});

