import { body } from 'express-validator'

export const createRoleValidation = [
  body('name')
    .notEmpty()
    .withMessage('Role name is required')
    .isString()
    .withMessage('Role name must be a string'),
]
