/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '@/app'
import { prismaClient } from '@/database/client'
import { sign } from 'jsonwebtoken'
import request from 'supertest'
import { UserSave } from '../user/repositories/IUserRepository'

describe('comment controller', () => {
  let user: UserSave
  let user2: UserSave
  let userToken: string
  let user2Token: string

  beforeAll(async () => {
    user = await prismaClient.user.create({
      data: {
        username: 'user1',
        password: 'TestPassword1234$',
      },
    })

    user2 = await prismaClient.user.create({
      data: {
        username: 'user2',
        password: 'TestPassword1234$',
      },
    })

    userToken = sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
    )

    user2Token = sign(
      { id: user2.id, username: user2.username },
      process.env.JWT_SECRET as string,
    )
  })

  describe('get comments', () => {
    it('should be possible to list the comments with their replies', async () => {
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

      const commentsWithRepliesResponse =
        await request(app).get('/api/v1/comments')

      expect(commentsWithRepliesResponse.status).toBe(200)
      expect(commentsWithRepliesResponse.body[0].id).toBe(
        createdCommentResponse.body.id,
      )
      expect(commentsWithRepliesResponse.body[0].replies[0].id).toBe(
        createdReplyResponse.body.id,
      )
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

      const comment = await prismaClient.comment.findUnique({
        where: { id: createdCommentResponse.body.id },
      })

      expect(createdCommentResponse.status).toBe(201)
      expect(createdCommentResponse.body).toHaveProperty('id')

      // Check if the comment is not a reply (has no parent or replyTo)
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
        .post('/api/v1/comments')
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

      const reply = await prismaClient.comment.findUnique({
        where: { id: createdReplyResponse.body.id },
      })

      expect(createdReplyResponse.body).toHaveProperty('id')
      expect(createdReplyResponse.status).toBe(201)

      // Check if the comment is a reply (has parent and replyTo)
      expect(reply?.parentId).toBe(createdCommentResponse.body.id)
      expect(reply?.replyToId).toBe(createdCommentResponse.body.id)
    })

    it('should not be possible to create a comment in response to its own comment', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
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
        .post('/api/v1/comments')
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
        .patch(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test edited content',
        })

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(createdCommentResponse.body.id)
      expect(response.body.content).toBe('Test edited content')
    })

    it('should not be possible to edit a comment without an authentication token', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .patch(`/api/v1/comments/${createdCommentResponse.body.id}`)
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
        .patch(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          content: 'Test edited content',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(
        'User is not authorized to edit this comment.',
      )
    })

    it('should not be possible to edit a non-existent comment', async () => {
      const response = await request(app)
        .patch('/api/v1/comments/123')
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
        .patch(`/api/v1/comments/${createdCommentResponse.body.id}`)
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
        .patch(`/api/v1/comments/${createdCommentResponse.body.id}`)
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

    it('It should not be possible to delete a comment from another user', async () => {
      const createdCommentResponse = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'Test content',
        })

      const response = await request(app)
        .delete(`/api/v1/comments/${createdCommentResponse.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(
        'User is not authorized to delete this comment.',
      )
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
