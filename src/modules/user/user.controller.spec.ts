/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '@/app'
import request from 'supertest'
import { IUserRepository } from './repositories/IUserRepository'
import { UserPrismaRepository } from './repositories/UserPrismaRepository'
import { sign } from 'jsonwebtoken'
import { hash } from 'bcrypt'

let userRepository: IUserRepository

beforeAll(async () => {
  userRepository = new UserPrismaRepository()
})

describe('user controller', () => {
  describe('create user', () => {
    it('should be able to create a user', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: 'test-integration',
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
    })

    it('should not be able to create an existing user', async () => {
      await request(app).post('/api/v1/users').send({
        username: 'test-integration-exist',
        password: 'TestPassword1234$',
      })

      const response = await request(app).post('/api/v1/users').send({
        username: 'test-integration-exist',
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Username already in use.')
    })

    it('should encrypt the user password', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: 'testinho',
        password: 'TestPassword1234$',
      })

      const user = await userRepository.findById(response.body.id)

      expect(user).toHaveProperty('id')
      expect(user?.password).not.toBe('TestPassword1234$')
    })

    it('should not be able to create a user with an invalid password', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: 'test',
        password: 'weakpassword',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Password must be at least 8 characters long, one uppercase letter, one lowercase letter, one number, and one special character',
      )
    })

    it('should reject a username with less than 2 characters', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: 'a',
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Username must have at least 2 characters.',
      )
    })

    it('should reject a username longer than 30 characters', async () => {
      const longUsername = 'a'.repeat(30 + 1)

      const response = await request(app).post('/api/v1/users').send({
        username: longUsername,
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Username must have at most 30 characters.',
      )
    })

    it('should reject a username with spaces', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: 'user with spaces',
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Username must not contain spaces.',
      )
    })

    it('should reject a username without letters', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: '123456',
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Username must contain at least one letter.',
      )
    })

    it('should not allow a username without letters', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: '123456',
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Username must contain at least one letter.',
      )
    })

    it('should not allow a username with special characters', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: 'user@name',
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Username must contain only letters, numbers, hyphens, and underscores.',
      )
    })
  })
  describe('get user', () => {
    it('should be able to get user data', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userRepository.save({
        username: 'user4',
        password: passwordHash,
      })

      const userToken = sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(200)
      expect(response.body.id).toEqual(user.id)
    })
    it('should not be able to get user data with an invalid token', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      await userRepository.save({
        username: 'user5',
        password: passwordHash,
      })

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid')

      expect(response.status).toBe(401)
      expect(response.body.message).toEqual('invalid token.')
    })

    it('should not be able to get user data without a token', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      await userRepository.save({
        username: 'user6',
        password: passwordHash,
      })

      const response = await request(app).get('/api/v1/users')

      expect(response.status).toBe(401)
      expect(response.body.message).toEqual('invalid token.')
    })
  })
  describe('edit user', () => {
    it('should be able to edit a user', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userRepository.save({
        username: 'user1',
        password: passwordHash,
      })

      const userToken = sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .put('/api/v1/users/')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'Jujuba$1234',
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id')
    })

    it('should not be able to edit a user with an invalid password', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userRepository.save({
        username: 'user2',
        password: passwordHash,
      })

      const userToken = sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .put('/api/v1/users/')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'invalidPassword',
        })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Password must be at least 8 characters long, one uppercase letter, one lowercase letter, one number, and one special character',
      )
    })

    it('should not be able to edit a user with an invalid token', async () => {
      const response = await request(app)
        .put('/api/v1/users/')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          password: 'Jujuba$1234',
        })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('invalid token.')
    })

    it('should not be able to edit a user without a token', async () => {
      const response = await request(app).put('/api/v1/users/').send({
        password: 'Jujuba$1234',
      })

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('invalid token.')
    })
  })
  describe('delete user', () => {
    it('should be able to delete a user', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userRepository.save({
        username: 'user3',
        password: passwordHash,
      })

      const userToken = sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .delete('/api/v1/users/')
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(204)

      const deletedUser = await userRepository.findById(user.id)

      expect(deletedUser).toHaveProperty('deletedAt')
      expect(deletedUser?.deletedAt).not.toBe(null)
    })

    it('should not be able to delete a user without authentication', async () => {
      const response = await request(app).delete('/api/v1/users/')

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('invalid token.')
    })

    it('should not be able to delete a user with an invalid token', async () => {
      const response = await request(app)
        .delete('/api/v1/users/')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('invalid token.')
    })
  })
})
