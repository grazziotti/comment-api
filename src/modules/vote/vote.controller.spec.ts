/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '@/app'
import { sign } from 'jsonwebtoken'
import request from 'supertest'
import { IUserRepository, UserSave } from '../user/repositories/IUserRepository'
import { CommentPrismaRepository } from '../comment/repositories/CommentPrismaRepository'
import { ICommentRepository } from '../comment/repositories/ICommentRepository'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'
import { IVoteRepository } from './repositories/IVoteRepository'
import { VotePrismaRepository } from './repositories/VotePrismaRepository'

let commentRepository: ICommentRepository
let userRepository: IUserRepository
let voteRepository: IVoteRepository
let user: UserSave
let user2: UserSave
let userToken: string
let user2Token: string

beforeAll(async () => {
  commentRepository = new CommentPrismaRepository()
  userRepository = new UserPrismaRepository()
  voteRepository = new VotePrismaRepository()

  user = await userRepository.save({
    username: 'user1',
    password: 'TestPassword1234$',
  })

  user2 = await userRepository.save({
    username: 'user2',
    password: 'TestPassword1234$',
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

describe('vote controller', () => {
  describe('create vote', () => {
    it('should create an upvote for a comment', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const response = await request(app)
        .post('/api/v1/votes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          commentId: createdCommentResult.id,
          voteType: 'upVote',
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.voteType).toBe('upVote')
    })
    it('should create a downvote for a comment', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const response = await request(app)
        .post('/api/v1/votes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          commentId: createdCommentResult.id,
          voteType: 'downVote',
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.voteType).toBe('downVote')
    })

    it('should not create a vote for a nonexistent comment', async () => {
      const response = await request(app)
        .post('/api/v1/votes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          commentId: '123',
          voteType: 'downVote',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Comment or reply not found.')
    })

    it('should not create a vote for a comment with an invalid voteType', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const response = await request(app)
        .post('/api/v1/votes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          commentId: createdCommentResult.id,
          voteType: 'upVote',
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.voteType).toBe('upVote')
    })
    it('should not create a vote if the user is the author of the comment', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const response = await request(app)
        .post('/api/v1/votes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          commentId: createdCommentResult.id,
          voteType: 'upVote',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User cannot vote their own comment.')
    })

    it('should not create a duplicate vote for the same comment by the same user', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      await request(app)
        .post('/api/v1/votes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          commentId: createdCommentResult.id,
          voteType: 'upVote',
        })

      const response = await request(app)
        .post('/api/v1/votes')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          commentId: createdCommentResult.id,
          voteType: 'upVote',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User has already voted this comment.')
    })
    it('should not create a vote without a token', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const response = await request(app).post('/api/v1/votes').send({
        commentId: createdCommentResult.id,
        voteType: 'upVote',
      })

      expect(response.status).toBe(401)
    })
    it('should not create a vote without a valid token', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const response = await request(app)
        .post('/api/v1/votes')
        .set('Authorization', `Bearer 123`)
        .send({
          commentId: createdCommentResult.id,
          voteType: 'upVote',
        })

      expect(response.status).toBe(401)
    })
  })
  describe('delete vote', () => {
    it('should delete a vote for a comment', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const vote = {
        commentId: createdCommentResult.id,
        userId: user2.id,
        voteType: 'upVote',
      }

      const createdVoteResult = await voteRepository.save(vote)

      const response = await request(app)
        .delete(`/api/v1/votes/${createdVoteResult.id}`)
        .set('Authorization', `Bearer ${user2Token}`)

      const deletedVote = await voteRepository.findById(createdVoteResult.id)

      expect(response.status).toBe(204)
      expect(deletedVote).toBe(null)
    })
    it('should not delete a vote of another user', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const vote = {
        commentId: createdCommentResult.id,
        userId: user2.id,
        voteType: 'upVote',
      }

      const createdVoteResult = await voteRepository.save(vote)

      const response = await request(app)
        .delete(`/api/v1/votes/${createdVoteResult.id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(
        'User is not authorized to delete this vote.',
      )
    })
    it('should not delete a nonexistent vote', async () => {
      const response = await request(app)
        .delete(`/api/v1/votes/123`)
        .set('Authorization', `Bearer ${user2Token}`)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Vote not found.')
    })
    it('should not delete a vote without a token', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const vote = {
        commentId: createdCommentResult.id,
        userId: user2.id,
        voteType: 'upVote',
      }

      const createdVoteResult = await voteRepository.save(vote)

      const response = await request(app).delete(
        `/api/v1/votes/${createdVoteResult.id}`,
      )

      expect(response.status).toBe(401)
    })
    it('should not delete a vote without a valid token', async () => {
      const comment = {
        content: 'Test content',
        userId: user.id,
        parentId: null,
        replyToId: null,
      }

      const createdCommentResult = await commentRepository.save(comment)

      const vote = {
        commentId: createdCommentResult.id,
        userId: user2.id,
        voteType: 'upVote',
      }

      const createdVoteResult = await voteRepository.save(vote)

      const response = await request(app)
        .delete(`/api/v1/votes/${createdVoteResult.id}`)
        .set('Authorization', 'Bearer 123')

      expect(response.status).toBe(401)
    })
  })
})