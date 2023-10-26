import { body } from 'express-validator'

export const createCommentValidation = [
  body('content').isLength({ min: 1 }).trim(),
]
