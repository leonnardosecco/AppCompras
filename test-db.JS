const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const purchases = await prisma.purchase.findMany();
    console.log('Compras encontradas:', purchases);
  } catch (error) {
    console.error('Erro ao consultar o banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
