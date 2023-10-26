import { Router } from 'express'
import { CommentController } from '@/modules/comment/comment.controller'
import { validateAuth } from '@/validators/validateAuth'
import { createCommentValidation } from '@/validators/commentValidator'
import { privateRoute } from '@/config/passport'

const commentRoutes = Router()
const commentController = new CommentController()

commentRoutes.get('/', commentController.getAll)

commentRoutes.post(
  '/:replyToId?',
  privateRoute,
  createCommentValidation,
  validateAuth,
  commentController.create,
)

commentRoutes.patch(
  '/:commentId',
  privateRoute,
  createCommentValidation,
  validateAuth,
  commentController.edit,
)

commentRoutes.delete('/:commentId', privateRoute, commentController.delete)

export default commentRoutes
