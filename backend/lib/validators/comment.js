import Joi from 'joi';

export const createCommentValidation = Joi.object({
  content: Joi.string().min(1).max(1000).required().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content is not allowed to be empty',
    'string.min': 'Content must be at least 1 character',
    'string.max': 'Content must be less than 1000 characters',
  }),
  post: Joi.string().required().messages({
    'any.required': 'Post ID is required',
    'string.empty': 'Post ID is not allowed to be empty',
  }),
});

export const updateCommentValidation = Joi.object({
  content: Joi.string().min(1).max(1000).optional().messages({
    'string.min': 'Content must be at least 1 character',
    'string.max': 'Content must be less than 1000 characters',
  }),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional().messages({
    'any.only': 'Status must be pending, approved, or rejected',
  }),
});

