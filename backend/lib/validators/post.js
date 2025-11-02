import Joi from 'joi';

export const createPostValidation = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is not allowed to be empty',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must be less than 200 characters',
  }),
  content: Joi.string().min(10).required().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content is not allowed to be empty',
    'string.min': 'Content must be at least 10 characters',
  }),
  excerpt: Joi.string().max(500).optional().messages({
    'string.max': 'Excerpt must be less than 500 characters',
  }),
  status: Joi.string().valid('draft', 'published').optional().messages({
    'any.only': 'Status must be either draft or published',
  }),
  tags: Joi.array().items(Joi.string()).optional(),
});

export const updatePostValidation = Joi.object({
  title: Joi.string().min(3).max(200).optional().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must be less than 200 characters',
  }),
  content: Joi.string().min(10).optional().messages({
    'string.min': 'Content must be at least 10 characters',
  }),
  excerpt: Joi.string().max(500).optional().messages({
    'string.max': 'Excerpt must be less than 500 characters',
  }),
  status: Joi.string().valid('draft', 'published').optional().messages({
    'any.only': 'Status must be either draft or published',
  }),
  tags: Joi.array().items(Joi.string()).optional(),
});

export const getPostsValidation = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  status: Joi.string().valid('draft', 'published').optional(),
  author: Joi.string().optional(),
});

