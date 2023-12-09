import { body } from 'express-validator'

export const createVoteValidation = [
  body('commentId')
    .notEmpty()
    .withMessage('Comment ID is required')
    .isString()
    .withMessage('Comment ID must be a string'),

  body('voteType')
    .notEmpty()
    .withMessage('Vote type is required')
    .isIn(['upVote', 'downVote'])
    .withMessage('Invalid vote type. Must be "upVote" or "downVote"'),
]
