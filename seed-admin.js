const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const phone = '05550000000';
  const existingAdmin = await prisma.user.findUnique({
    where: { phone },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name: 'Sistem Yöneticisi',
        role: 'ADMIN',
      },
    });
    console.log('Admin user created successfully!');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
