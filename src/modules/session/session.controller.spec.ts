/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '@/app'
import request from 'supertest'
import { IUserRepository } from '../user/repositories/IUserRepository'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'
import { hash } from 'bcrypt'

let userRepository: IUserRepository

beforeAll(async () => {
  userRepository = new UserPrismaRepository()

  const password = 'TestPassword1234$'

  const passwordHash = await hash(password, 8)

  await userRepository.save({
    username: 'user1',
    password: passwordHash,
  })
})

describe('session controller', () => {
  it('should successfully log in with valid credentials', async () => {
    const response = await request(app).post('/api/v1/sessions/').send({
      username: 'user1',
      password: 'TestPassword1234$',
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
  })

  it('should reject login with invalid credentials', async () => {
    const response = await request(app).post('/api/v1/sessions/').send({
      username: 'user1',
      password: 'TestPassword1234$$$$',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Invalid credentials.')
  })

  it('should handle login for a non-existent user', async () => {
    const response = await request(app).post('/api/v1/sessions/').send({
      username: 'nonexistentuser',
      password: 'TestPassword1234$',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Invalid credentials.')
  })

  it('should handle login for a inactive user', async () => {
    const password = 'TestPassword1234$'

    const passwordHash = await hash(password, 8)

    const user = await userRepository.save({
      username: 'user2',
      password: passwordHash,
    })

    await userRepository.delete(user.id)

    const response = await request(app).post('/api/v1/sessions/').send({
      username: 'user2',
      password: 'TestPassword1234$',
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('Invalid credentials.')
  })

  it('should reject a username with less than 2 characters', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      username: 'a',
      password: 'TestPassword1234$',
    })

    expect(response.status).toBe(400)
    expect(response.body.errors[0].msg).toBe(
      'Username must have at least 2 characters.',
    )
  })
})
