/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '@/app'
import request from 'supertest'
import { IUserRepository } from './repositories/IUserRepository'
import { UserPrismaRepository } from './repositories/UserPrismaRepository'

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

      expect(response.status).toBe(200)
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
})
