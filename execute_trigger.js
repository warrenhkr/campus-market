const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  const sqlPath = path.join(__dirname, '../admin-recovery/supabase/update_trigger.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  
  console.log('Executing SQL...')
  await prisma.$executeRawUnsafe(sql)
  console.log('Success!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
