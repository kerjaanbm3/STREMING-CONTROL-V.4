import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.overlay.updateMany({ where: { title: { contains: 'Kuning' } }, data: { path: '/overlay/alerts?filter=YELLOW_CARD' } });
  await prisma.overlay.updateMany({ where: { title: { contains: 'Merah' } }, data: { path: '/overlay/alerts?filter=RED_CARD' } });
  await prisma.overlay.updateMany({ where: { title: { contains: 'Waktu' } }, data: { path: '/overlay/alerts?filter=TIME' } });
  await prisma.overlay.updateMany({ where: { title: { contains: 'Goal Celebration' } }, data: { path: '/overlay/alerts?filter=GOAL' } });
  await prisma.overlay.updateMany({ where: { title: { contains: 'First Blood' } }, data: { path: '/overlay/alerts?filter=FIRST_BLOOD' } });
  await prisma.overlay.updateMany({ where: { title: { contains: 'Turtle' } }, data: { path: '/overlay/alerts?filter=OBJECTIVE' } });
  console.log('Updated DB');
}
main().catch(console.error).finally(() => prisma.$disconnect());
