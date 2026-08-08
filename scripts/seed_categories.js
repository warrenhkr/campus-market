const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const names = [
    'Food',
    'Clothes',
    'Tech',
    'Books',
    'Services',
    'Health',
    'Home'
  ]

  for (const name of names) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    })
  }

  const all = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  console.log('Categories in DB:', all.map((c) => c.name))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
