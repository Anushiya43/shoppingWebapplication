const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const productCount = await prisma.product.count();
  console.log('---CHECK---');
  console.log('Product Count:', productCount);
  console.log('---END---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
