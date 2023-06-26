import { PrismaClient } from '@prisma/client'

const clientPrisma = new PrismaClient({
  errorFormat: 'minimal',
})

export default clientPrisma
