import { SetupServer } from '@src/server'
import supertest from 'supertest'

let server: SetupServer

beforeAll(async () => {
  server = new SetupServer()
  await server.init()
  global.testRequest = supertest(await server.start())
})

afterAll(async () => {
  await server.close()
})
