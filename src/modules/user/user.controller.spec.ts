/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '../../app'
import request from 'supertest'
import { IUserRepository } from './repositories/IUserRepository'
import { UserPrismaRepository } from './repositories/UserPrismaRepository'
import { sign } from 'jsonwebtoken'
import { hash } from 'bcrypt'
import { RolePrismaRepository } from '../role/repositories/RolePrismaRepository'
import { UserRolePrismaRepository } from '../userRole/repositories/UserRolePrismaRepository'
import { RoleSave } from '../role/repositories/IRoleRepository'

let userPrismaRepository: IUserRepository
let rolePrismaRepository: RolePrismaRepository
let userRolePrismaRepository: UserRolePrismaRepository
let roleUser: RoleSave
let roleAdmin: RoleSave

beforeAll(async () => {
  userPrismaRepository = new UserPrismaRepository()
  rolePrismaRepository = new RolePrismaRepository()
  userRolePrismaRepository = new UserRolePrismaRepository()

  roleUser = await rolePrismaRepository.save({ name: 'user' })
  roleAdmin = await rolePrismaRepository.save({ name: 'admin' })
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
        username: 'test-exist',
        password: 'TestPassword1234$',
      })

      const response = await request(app).post('/api/v1/users').send({
        username: 'test-exist',
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

      const user = await userPrismaRepository.findById(response.body.id)

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

    it('should reject a username with less than 4 characters', async () => {
      const response = await request(app).post('/api/v1/users').send({
        username: 'a',
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Username must have at least 4 characters.',
      )
    })

    it('should reject a username longer than 20 characters', async () => {
      const longUsername = 'a'.repeat(30 + 1)

      const response = await request(app).post('/api/v1/users').send({
        username: longUsername,
        password: 'TestPassword1234$',
      })

      expect(response.status).toBe(400)
      expect(response.body.errors[0].msg).toBe(
        'Username must have at most 20 characters.',
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

      const user = await userPrismaRepository.save({
        username: 'user4',
        password: passwordHash,
        avatar: null,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user.id,
      })

      const userToken = sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .get(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(200)
      expect(response.body.id).toEqual(user.id)
    })
    it('should not be able to get user data with an invalid token', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user85',
        password: passwordHash,
        avatar: null,
      })

      const response = await request(app)
        .get(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer invalid`)

      expect(response.status).toBe(401)
      expect(response.text).toEqual('{"error":"Invalid token."}')
    })

    it('should not be able to get user data without a token', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user6',
        password: passwordHash,
        avatar: null,
      })

      const response = await request(app).get(`/api/v1/users/${user.id}`)

      expect(response.status).toBe(401)
      expect(response.text).toEqual('{"error":"Invalid token."}')
    })
  })
  describe('edit user', () => {
    it('should be able to edit a user', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user1',
        password: passwordHash,
        avatar: null,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user.id,
      })

      const userToken = sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'Jujuba$1234',
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id')
    })

    it('should be able to edit another user if the user is an admin', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user89',
        password: passwordHash,
        avatar: null,
      })

      const admin = await userPrismaRepository.save({
        username: 'admin',
        password: passwordHash,
        avatar: null,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user.id,
      })

      await userRolePrismaRepository.save({
        roleId: roleAdmin.id,
        userId: admin.id,
      })

      const adminToken = sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          password: 'Jujuba$1234',
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('id')
    })

    it('should not be able to edit another user', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user87',
        password: passwordHash,
        avatar: null,
      })

      const user2 = await userPrismaRepository.save({
        username: 'user88',
        password: passwordHash,
        avatar: null,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user.id,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user2.id,
      })

      const user2Token = sign(
        { id: user2.id, username: user2.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          password: 'Jujuba$1234',
        })

      expect(response.status).toBe(401)
    })

    it('should not be able to edit a user with an invalid password', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user2',
        password: passwordHash,
        avatar: null,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user.id,
      })

      const userToken = sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
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
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user3',
        password: passwordHash,
        avatar: null,
      })

      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', 'Bearer invalid-token')
        .send({
          password: 'Jujuba$1234',
        })

      expect(response.status).toBe(401)
      expect(response.text).toEqual('{"error":"Invalid token."}')
    })

    it('should not be able to edit a user without a token', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user10',
        password: passwordHash,
        avatar: null,
      })

      const response = await request(app).put(`/api/v1/users/${user.id}`).send({
        password: 'Jujuba$1234',
      })

      expect(response.status).toBe(401)
      expect(response.text).toEqual('{"error":"Invalid token."}')
    })
  })
  describe('delete user', () => {
    it('should be able to delete a user', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user7',
        password: passwordHash,
        avatar: null,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user.id,
      })

      const userToken = sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(204)

      const deletedUser = await userPrismaRepository.findById(user.id)

      expect(deletedUser).toHaveProperty('deletedAt')
      expect(deletedUser?.deletedAt).not.toBe(null)
    })

    it('should not be able to delete another user', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user90',
        password: passwordHash,
        avatar: null,
      })

      const user2 = await userPrismaRepository.save({
        username: 'user91',
        password: passwordHash,
        avatar: null,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user.id,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user2.id,
      })

      const user2Token = sign(
        { id: user2.id, username: user2.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${user2Token}`)

      expect(response.status).toBe(401)
    })

    it('should be able to delete another user if the user is an admin', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user93',
        password: passwordHash,
        avatar: null,
      })

      const admin = await userPrismaRepository.save({
        username: 'admin2',
        password: passwordHash,
        avatar: null,
      })

      await userRolePrismaRepository.save({
        roleId: roleUser.id,
        userId: user.id,
      })

      await userRolePrismaRepository.save({
        roleId: roleAdmin.id,
        userId: admin.id,
      })

      const adminToken = sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET as string,
      )

      const response = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(204)

      const deletedUser = await userPrismaRepository.findById(user.id)

      expect(deletedUser).toHaveProperty('deletedAt')
      expect(deletedUser?.deletedAt).not.toBe(null)
    })

    it('should not be able to delete a user without authentication', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user5',
        password: passwordHash,
        avatar: null,
      })

      const response = await request(app).delete(`/api/v1/users/${user.id}`)

      expect(response.status).toBe(401)
      expect(response.text).toEqual('{"error":"Invalid token."}')
    })

    it('should not be able to delete a user with an invalid token', async () => {
      const password = 'TestPassword1234$'
      const passwordHash = await hash(password, 8)

      const user = await userPrismaRepository.save({
        username: 'user8',
        password: passwordHash,
        avatar: null,
      })

      const response = await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
      expect(response.text).toEqual('{"error":"Invalid token."}')
    })
  })
})
