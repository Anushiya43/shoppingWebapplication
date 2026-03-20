const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
  try {
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        SUM("totalAmount") as revenue
      FROM "Order"
      WHERE 
        EXTRACT(YEAR FROM "createdAt") = ${currentYear}
        AND status = 'DELIVERED'
      GROUP BY month
      ORDER BY month ASC
    `;
    console.log('Query result:', JSON.stringify(monthlyRevenue, null, 2));
  } catch (err) {
    console.error('Query failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
