import { body } from 'express-validator'

export const createUserValidation = [
  body('username')
    .isLength({ min: 2 })
    .trim()
    .isLowercase()
    .not()
    .matches(/\s/)
    .withMessage(
      'Username must be at least 2 characters long, should not contain spaces, and should be in lowercase.',
    ),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage(
      'Password must be at least 8 characters long, one uppercase letter, one lowercase letter, one number, and one special character',
    ),
]
