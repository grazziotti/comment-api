import { body } from 'express-validator'

export const createUserValidation = [
  body('username')
    .isLength({ min: 4 })
    .withMessage('Username must have at least 4 characters.')
    .isLength({ max: 20 })
    .withMessage('Username must have at most 20 characters.')
    .trim()
    .isLowercase()
    .withMessage('Username must be in lowercase.')
    .not()
    .matches(/\s/)
    .withMessage('Username must not contain spaces.')
    .matches(/[a-zA-Z]/)
    .withMessage('Username must contain at least one letter.')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username must contain only letters, numbers, hyphens, and underscores.',
    ),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage(
      'Password must be at least 8 characters long, one uppercase letter, one lowercase letter, one number, and one special character',
    ),
]

export const editUserValidation = [
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage(
      'Password must be at least 8 characters long, one uppercase letter, one lowercase letter, one number, and one special character',
    ),
]

export const userRoleValidation = [
  body('roleId')
    .notEmpty()
    .withMessage('role id is required')
    .isString()
    .withMessage('role id must be a string'),
  body('userId')
    .notEmpty()
    .withMessage('user id is required')
    .isString()
    .withMessage('user id must be a string'),
]
