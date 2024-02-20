import { Router } from 'express'
import { CommentController } from '@/modules/comment/comment.controller'
import { validateAuth } from '@/validators/validateAuth'
import { createCommentValidation } from '@/validators/commentValidator'
import { privateRoute } from '@/config/passport'
import { authComment } from '@/middlewares/comment'

const commentRoutes = Router()
const commentController = new CommentController()

commentRoutes.get('/private', privateRoute, commentController.getAllPrivate)

commentRoutes.get('/public', commentController.getAllPublic)

commentRoutes.get('/:commentId', commentController.get)

commentRoutes.post(
  '/',
  privateRoute,
  createCommentValidation,
  validateAuth,
  commentController.create,
)

commentRoutes.post(
  '/reply',
  privateRoute,
  createCommentValidation,
  validateAuth,
  commentController.create,
)

commentRoutes.put(
  '/:commentId',
  privateRoute,
  authComment,
  createCommentValidation,
  validateAuth,
  commentController.edit,
)

commentRoutes.delete(
  '/:commentId',
  privateRoute,
  authComment,
  commentController.delete,
)

export default commentRoutes
