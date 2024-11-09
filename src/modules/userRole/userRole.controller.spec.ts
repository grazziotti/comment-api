/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '@/app'
import { sign } from 'jsonwebtoken'
import request from 'supertest'
import { IUserRepository, UserSave } from '../user/repositories/IUserRepository'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'
import { UserRolePrismaRepository } from '../userRole/repositories/UserRolePrismaRepository'
import {
  IUserRoleRepository,
  UserRoleCreate,
} from '../userRole/repositories/IUserRoleRepository'
import { IRoleRepository, RoleSave } from '../role/repositories/IRoleRepository'
import { RolePrismaRepository } from '../role/repositories/RolePrismaRepository'
import { hash } from 'bcrypt'

let userRepository: IUserRepository
let userRoleRepository: IUserRoleRepository
let roleRepository: IRoleRepository
let user: UserSave
let user2: UserSave
let admin: UserSave
let adminToken: string
let roleUser: RoleSave
let roleAdmin: RoleSave

beforeAll(async () => {
  userRepository = new UserPrismaRepository()
  userRoleRepository = new UserRolePrismaRepository()
  roleRepository = new RolePrismaRepository()

  const password = 'TestPassword1234$'

  const passwordHash = await hash(password, 8)

  user = await userRepository.save({
    username: 'user1',
    password: passwordHash,
    avatar: null,
  })

  user2 = await userRepository.save({
    username: 'user2',
    password: passwordHash,
    avatar: null,
  })

  admin = await userRepository.save({
    username: 'admin',
    password: passwordHash,
    avatar: null,
  })

  roleUser = await roleRepository.save({ name: 'user' })
  roleAdmin = await roleRepository.save({ name: 'admin' })

  await userRoleRepository.save({ roleId: roleAdmin.id, userId: admin.id })

  adminToken = sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET as string,
  )
})

describe('userRole controller', () => {
  describe('create userRole', () => {
    it('should be able to create a userRole', async () => {
      const userRoleData: UserRoleCreate = {
        roleId: roleUser.id,
        userId: user.id,
      }

      const response = await request(app)
        .post('/api/v1/users/acl')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userRoleData)

      expect(response.status).toBe(201)
      expect(response.body.roleId).toBe(userRoleData.roleId)
      expect(response.body.userId).toBe(userRoleData.userId)
    })

    it('should not be able to create a userRole if the user does not exist', async () => {
      const userRoleData: UserRoleCreate = {
        roleId: roleUser.id,
        userId: '123',
      }

      const response = await request(app)
        .post('/api/v1/users/acl')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userRoleData)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User not found.')
    })

    it('should not be able to create a userRole if the role does not exist', async () => {
      const userRoleData: UserRoleCreate = {
        roleId: '123',
        userId: user.id,
      }

      const response = await request(app)
        .post('/api/v1/users/acl')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userRoleData)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Role not found.')
    })

    it('should not be able to create a userRole if the role does not exist', async () => {
      const userRoleData: UserRoleCreate = {
        roleId: '123',
        userId: user.id,
      }

      const response = await request(app)
        .post('/api/v1/users/acl')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userRoleData)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Role not found.')
    })

    it('should not be able to create a userRole if the user already has the role', async () => {
      const userRoleData: UserRoleCreate = {
        roleId: roleUser.id,
        userId: user2.id,
      }

      await userRoleRepository.save(userRoleData)

      const response = await request(app)
        .post('/api/v1/users/acl')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userRoleData)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User already has this role.')
    })

    it('should not be able to create a userRole without a token', async () => {
      const userRoleData: UserRoleCreate = {
        roleId: roleUser.id,
        userId: user.id,
      }

      const response = await request(app)
        .post('/api/v1/users/acl')
        .send(userRoleData)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid token.')
    })

    it('should not be able to create a userRole without a valid token', async () => {
      const userRoleData: UserRoleCreate = {
        roleId: roleUser.id,
        userId: user.id,
      }

      const response = await request(app)
        .post('/api/v1/users/acl')
        .set('Authorization', `Bearer invalid`)
        .send(userRoleData)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid token.')
    })
  })
})
