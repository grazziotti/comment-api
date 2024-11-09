/**
 * @jest-environment ./prisma/prisma-environment-jest
 */

import { app } from '@/app'
import { sign } from 'jsonwebtoken'
import request from 'supertest'
import { IUserRepository, UserSave } from '../user/repositories/IUserRepository'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'
import { UserRolePrismaRepository } from '../userRole/repositories/UserRolePrismaRepository'
import { IUserRoleRepository } from '../userRole/repositories/IUserRoleRepository'
import { IRoleRepository } from '../role/repositories/IRoleRepository'
import { RolePrismaRepository } from '../role/repositories/RolePrismaRepository'
import { hash } from 'bcrypt'

let userRepository: IUserRepository
let userRoleRepository: IUserRoleRepository
let roleRepository: IRoleRepository
let user: UserSave
let admin: UserSave
let userToken: string
let adminToken: string

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

  admin = await userRepository.save({
    username: 'user2',
    password: passwordHash,
    avatar: null,
  })

  const roleUser = await roleRepository.save({ name: 'user' })
  const roleAdmin = await roleRepository.save({ name: 'admin' })

  await userRoleRepository.save({
    roleId: roleUser.id,
    userId: user.id,
  })

  await userRoleRepository.save({
    roleId: roleAdmin.id,
    userId: admin.id,
  })

  userToken = sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET as string,
  )

  adminToken = sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET as string,
  )
})

describe('role controller', () => {
  describe('get role', () => {
    it('should be able to get a role by its id', async () => {
      const newRoleName = 'tester'

      const createdRole = await roleRepository.save({ name: newRoleName })

      const response = await request(app)
        .get(`/api/v1/roles/${createdRole.id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.name).toEqual(createdRole.name)
    })

    it('should not be able to get a role by its id if the user is not an admin', async () => {
      const newRoleName = 'tester2'

      const createdRole = await roleRepository.save({ name: newRoleName })

      const response = await request(app)
        .get(`/api/v1/roles/${createdRole.id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
    })

    it('should not be able to get a role by its id without a token', async () => {
      const newRoleName = 'tester3'

      const createdRole = await roleRepository.save({ name: newRoleName })

      const response = await request(app).get(`/api/v1/roles/${createdRole.id}`)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid token.')
    })

    it('should not be able to get a role by its id without a valid token', async () => {
      const newRoleName = 'tester4'

      const createdRole = await roleRepository.save({ name: newRoleName })

      const response = await request(app)
        .get(`/api/v1/roles/${createdRole.id}`)
        .set('Authorization', `Bearer invalid`)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid token.')
    })
  })
  describe('create role', () => {
    it('should be able to create a role', async () => {
      const newRoleName = 'moderator'

      const response = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: newRoleName,
        })

      expect(response.status).toBe(201)
      expect(response.body.name).toBe(newRoleName)
    })

    it('should not be able to create a role if the role already exists', async () => {
      const newRoleName = 'manager'

      await roleRepository.save({ name: newRoleName })

      const response = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: newRoleName,
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('This role already exists.')
    })

    it('should not be able to create a role if the user is not an admin', async () => {
      const newRoleName = 'tester5'

      const response = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: newRoleName,
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Unauthorized')
    })

    it('should not be able to create a role without a token', async () => {
      const newRoleName = 'moderator'

      const response = await request(app).post('/api/v1/roles').send({
        name: newRoleName,
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid token.')
    })

    it('should not be able to create a role without a valid token', async () => {
      const newRoleName = 'moderator'

      const response = await request(app)
        .post('/api/v1/roles')
        .set('Authorization', `Bearer invalid`)
        .send({
          name: newRoleName,
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid token.')
    })
  })
})
