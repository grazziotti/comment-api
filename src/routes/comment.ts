import { Router } from 'express'
import { CommentController } from '@/modules/comment/comment.controller'
import { validateAuth } from '@/validators/validateAuth'
import { createCommentValidation } from '@/validators/commentValidator'
import { privateRoute } from '@/config/passport'

const commentRoutes = Router()
const commentController = new CommentController()

commentRoutes.get('/:id', commentController.get)

commentRoutes.get('/', commentController.getAll)

commentRoutes.post(
  '/',
  privateRoute,
  createCommentValidation,
  validateAuth,
  commentController.create,
)

commentRoutes.put(
  '/:id',
  privateRoute,
  createCommentValidation,
  validateAuth,
  commentController.edit,
)

commentRoutes.delete('/:id', privateRoute, commentController.delete)

export default commentRoutes
