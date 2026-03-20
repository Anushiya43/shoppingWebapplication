const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });
    console.log(JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
