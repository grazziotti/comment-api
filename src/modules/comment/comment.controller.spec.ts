/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '@/app'
import { sign } from 'jsonwebtoken'
import request from 'supertest'
import { IUserRepository, UserSave } from '../user/repositories/IUserRepository'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'
import { hash } from 'bcrypt'
import { CommentPrismaRepository } from './repositories/CommentPrismaRepository'
import { ICommentRepository } from './repositories/ICommentRepository'
import { UserRolePrismaRepository } from '../userRole/repositories/UserRolePrismaRepository'
import { IUserRoleRepository } from '../userRole/repositories/IUserRoleRepository'
import { IRoleRepository } from '../role/repositories/IRoleRepository'
import { RolePrismaRepository } from '../role/repositories/RolePrismaRepository'

let userRepository: IUserRepository
let userRoleRepository: IUserRoleRepository
let roleRepository: IRoleRepository
let commentRepository: ICommentRepository
let user: UserSave
let user2: UserSave
let admin: UserSave
let userToken: string
let user2Token: string
let adminToken: string

beforeAll(async () => {
  userRepository = new UserPrismaRepository()
  userRoleRepository = new UserRolePrismaRepository()
  roleRepository = new RolePrismaRepository()
  commentRepository = new CommentPrismaRepository()

  const password = 'TestPassword1234$'

  const passwordHash = await hash(password, 8)

  user = await userRepository.save({
    username: 'user1',
    password: passwordHash,
  })

  user2 = await userRepository.save({
    username: 'user2',
    password: passwordHash,
  })

  admin = await userRepository.save({
    username: 'admin',
    password: passwordHash,
  })

  const roleUser = await roleRepository.save({ name: 'user' })
  const roleAdmin = await roleRepository.save({ name: 'admin' })

  await userRoleRepository.save({
    roleId: roleUser.id,
    userId: user.id,
  })

  await userRoleRepository.save({
    roleId: roleUser.id,
    userId: user2.id,
  })

  await userRoleRepository.save({
    roleId: roleAdmin.id,
    userId: admin.id,
  })

  userToken = sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET as string,
  )

  user2Token = sign(
    { id: user2.id, username: user2.username },
    process.env.JWT_SECRET as string,
  )

  adminToken = sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET as string,
  )
})

describe('comment controller', () => {
  describe('get comments', () => {
    it('should be possible to list public route comments with their replies and score', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Testing content for the main comment',
        })

      const createdReplyResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          content: 'Testing reply content',
          replyToId: createdCommentResponse.body.id,
        })

      const commentsWithRepliesResponse = await request(app).get(
        '/api/v1/comments/public',
      )

      expect(commentsWithRepliesResponse.status).toBe(200)
      expect(commentsWithRepliesResponse.body[0]).toHaveProperty('score')
      expect(commentsWithRepliesResponse.body[0]).not.toHaveProperty('voted')
      expect(commentsWithRepliesResponse.body[0].id).toBe(
        createdCommentResponse.body.id,
      )
      expect(commentsWithRepliesResponse.body[0].replies[0].id).toBe(
        createdReplyResponse.body.id,
      )
    })

    it('should be possible to list private route comments with their replies and score', async () => {
      const commentsWithRepliesResponse = await request(app)
        .get('/api/v1/comments/private')
        .set('Authorization', `Bearer ${user2Token}`)

      expect(commentsWithRepliesResponse.status).toBe(200)
      expect(commentsWithRepliesResponse.body[0]).toHaveProperty('score')
      expect(commentsWithRepliesResponse.body[0]).toHaveProperty('voted')
    })

    it('should not be possible to list the private route comments without a valid token', async () => {
      const commentsWithRepliesResponse = await request(app)
        .get('/api/v1/comments/private')
        .set('Authorization', `Bearer 123`)

      expect(commentsWithRepliesResponse.status).toBe(401)
    })
  })

  describe('create comment', () => {
    it('should be able to create a comment', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const comment = await commentRepository.findById(
        createdCommentResponse.body.id,
      )

      expect(createdCommentResponse.status).toBe(201)
      expect(createdCommentResponse.body).toHaveProperty('id')

      expect(comment?.parentId).toBe(null)
      expect(comment?.replyToId).toBe(null)
    })

    it('should not be able to create a comment without a valid token', async () => {
      const response = await request(app).post('/api/v1/comments').send({
        content: 'Test content',
      })

      expect(response.status).toBe(401)
    })

    it('should not be possible to create a comment without content', async () => {
      const response = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send()

      expect(response.status).toBe(400)
    })

    it('should not be possible to create a comment with empty content', async () => {
      const response = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: '',
        })

      expect(response.status).toBe(400)
    })
  })
  describe('create reply', () => {
    it('should be able to create a reply', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments/reply')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const createdReplyResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          content: 'Test reply',
          replyToId: createdCommentResponse.body.id,
        })

      const reply = await commentRepository.findById(
        createdReplyResponse.body.id,
      )

      expect(createdReplyResponse.body).toHaveProperty('id')
      expect(createdReplyResponse.status).toBe(201)

      expect(reply?.parentId).toBe(createdCommentResponse.body.id)
      expect(reply?.replyToId).toBe(createdCommentResponse.body.id)
    })

    it('should not be possible to create a comment in response to its own comment', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments/reply')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test reply',
          replyToId: createdCommentResponse.body.id,
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User cannot reply to themselves.')
    })

    it('should not be possible to create a comment in response to a non-existent comment', async () => {
      const response = await request(app)
        .post('/api/v1/comments/reply')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test reply',
          replyToId: '123',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Comment to reply not found.')
    })
  })
  describe('edit comment', () => {
    it('should be possible to successfully edit a comment', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .put(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test edited content',
        })

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(createdCommentResponse.body.id)
      expect(response.body.content).toBe('Test edited content')
      expect(response.body.updatedAt).not.toBeNull()
    })

    it('should not be possible to edit a comment without an authentication token', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .put(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .send({
          content: 'Test edited content',
        })

      expect(response.status).toBe(401)
    })

    it('should not be possible to edit a comment from another user', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .put(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          content: 'Test edited content',
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
    })

    it('should be possible to edit another user comment if the user editing is an admin', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .put(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Test edited content',
        })

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(createdCommentResponse.body.id)
      expect(response.body.content).toBe('Test edited content')
      expect(response.body.updatedAt).not.toBeNull()
    })

    it('should not be possible to edit a non-existent comment', async () => {
      const response = await request(app)
        .put('/api/v1/comments/123')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Comment not found.')
    })

    it('should not be possible to edit a comment without content.', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Comment for edit',
        })

      const response = await request(app)
        .put(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send()

      expect(response.status).toBe(400)
    })

    it('should not be possible to edit a comment with empty content', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: '',
        })

      const response = await request(app)
        .put(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send()

      expect(response.status).toBe(400)
    })
  })
  describe('delete comment', () => {
    it('should be able to delete a comment', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .delete(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(204)
    })

    it('should not be possible to delete a comment without an authentication token', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app).delete(
        `/api/v1/comments/${createdCommentResponse.body.id}`,
      )

      expect(response.status).toBe(401)
    })

    it('should not be possible to delete a comment from another user', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .delete(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
    })

    it('should be possible to delete another user comment if the user deleting is an admin', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .delete(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(204)
    })

    it('should not be possible to delete a non-existent comment', async () => {
      const response = await request(app)
        .delete('/api/v1/comments/123')
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Comment not found.')
    })
  })
})
